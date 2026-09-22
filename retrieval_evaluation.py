import json
import random
import numpy as np
import torch

from retrieval.bm25 import bm25_search
from retrieval.dense_retrieval import dense_search
from retrieval.hybrid_rrf import reciprocal_rank_fusion
from reranking.reranker import rerank_candidates

CORPUS_PATH = "data/pubmed_corpus/pubmed_abstracts_final.json"
BM25_PATH = "artifacts/bm25_index.pkl"
FAISS_PATH = "artifacts/faiss_index.bin"

from retrieval.loader import load_corpus, load_bm25, load_faiss_index
from transformers import AutoTokenizer, AutoModel

corpus = load_corpus(CORPUS_PATH)
bm25 = load_bm25(BM25_PATH)
faiss_index = load_faiss_index(FAISS_PATH)

device = "cuda" if torch.cuda.is_available() else "cpu"

print("Corpus:", len(corpus))
print("Device:", device)

print("Loading MedCPT query encoder...")
query_tokenizer = AutoTokenizer.from_pretrained("ncbi/MedCPT-Query-Encoder")
query_model = AutoModel.from_pretrained("ncbi/MedCPT-Query-Encoder").to(device)
query_model.eval()

print("Loading MedCPT reranker...")
reranker_tokenizer = AutoTokenizer.from_pretrained("ncbi/MedCPT-Cross-Encoder")
from transformers import AutoModelForSequenceClassification
reranker_model = AutoModelForSequenceClassification.from_pretrained(
    "ncbi/MedCPT-Cross-Encoder"
).to(device)
reranker_model.eval()

# Fixed sample so results are reproducible
random.seed(42)
indices = random.sample(range(len(corpus)), 50)

metrics = {
    "bm25": [],
    "dense": [],
    "rrf": [],
    "reranked": []
}

def reciprocal_rank(results, gold):
    for rank, idx in enumerate(results, 1):
        if idx == gold:
            return 1.0 / rank
    return 0.0

for n, gold_idx in enumerate(indices, 1):
    doc = corpus[gold_idx]

    # Use the document title as the retrieval query.
    query = doc["title"]

    bm25_results = bm25_search(bm25, query, top_k=10).tolist()

    dense_results = dense_search(
        query,
        query_tokenizer,
        query_model,
        faiss_index,
        device,
        top_k=10
    )
    dense_indices = [idx for idx, score in dense_results]

    rrf_results = reciprocal_rank_fusion(
        [bm25_results, dense_indices],
        k=60
    )[:10]

    rrf_indices = [idx for idx, score in rrf_results]

    reranked = rerank_candidates(
        query=query,
        candidate_indices=rrf_indices,
        corpus=corpus,
        tokenizer=reranker_tokenizer,
        model=reranker_model,
        device=device,
        top_k=10
    )

    reranked_indices = [x["index"] for x in reranked]

    metrics["bm25"].append({
        "r5": int(gold_idx in bm25_results[:5]),
        "r10": int(gold_idx in bm25_results[:10]),
        "rr": reciprocal_rank(bm25_results, gold_idx)
    })

    metrics["dense"].append({
        "r5": int(gold_idx in dense_indices[:5]),
        "r10": int(gold_idx in dense_indices[:10]),
        "rr": reciprocal_rank(dense_indices, gold_idx)
    })

    metrics["rrf"].append({
        "r5": int(gold_idx in rrf_indices[:5]),
        "r10": int(gold_idx in rrf_indices[:10]),
        "rr": reciprocal_rank(rrf_indices, gold_idx)
    })

    metrics["reranked"].append({
        "r5": int(gold_idx in reranked_indices[:5]),
        "r10": int(gold_idx in reranked_indices[:10]),
        "rr": reciprocal_rank(reranked_indices, gold_idx)
    })

    print(f"{n}/50 complete")

print("\n================ RETRIEVAL EVALUATION ================")

for name, values in metrics.items():
    recall5 = np.mean([x["r5"] for x in values])
    recall10 = np.mean([x["r10"] for x in values])
    mrr = np.mean([x["rr"] for x in values])

    print(
        f"{name:10s} | "
        f"Recall@5: {recall5:.4f} | "
        f"Recall@10: {recall10:.4f} | "
        f"MRR: {mrr:.4f}"
    )
