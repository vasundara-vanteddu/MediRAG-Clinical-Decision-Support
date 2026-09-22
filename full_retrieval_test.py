import json
import pickle
import torch
import faiss

from transformers import AutoTokenizer, AutoModel
from transformers import AutoModelForSequenceClassification

from retrieval.reranked_retrieval import retrieve_and_rerank


CORPUS_PATH = "data/pubmed_corpus/pubmed_abstracts_final.json"
BM25_PATH = "artifacts/bm25_index.pkl"
FAISS_PATH = "artifacts/faiss_index.bin"

QUERY_MODEL = "ncbi/MedCPT-Query-Encoder"
RERANKER_MODEL = "ncbi/MedCPT-Cross-Encoder"

QUERY = "polycystic ovary syndrome cardiovascular risk"


# --------------------------------------------------
# 1. Load corpus
# --------------------------------------------------

print("Loading corpus...")

with open(CORPUS_PATH, "r", encoding="utf-8") as f:
    corpus = json.load(f)

print("Corpus:", len(corpus))


# --------------------------------------------------
# 2. Load BM25
# --------------------------------------------------

print("Loading BM25...")

with open(BM25_PATH, "rb") as f:
    bm25 = pickle.load(f)

print("BM25 documents:", len(bm25.doc_freqs))


# --------------------------------------------------
# 3. Load FAISS
# --------------------------------------------------

print("Loading FAISS...")

faiss_index = faiss.read_index(FAISS_PATH)

print(
    "FAISS:",
    faiss_index.ntotal,
    "vectors ×",
    faiss_index.d,
    "dimensions"
)


# --------------------------------------------------
# 4. Load MedCPT Query Encoder
# --------------------------------------------------

print("\nLoading MedCPT Query Encoder...")

query_tokenizer = AutoTokenizer.from_pretrained(
    QUERY_MODEL
)

query_model = AutoModel.from_pretrained(
    QUERY_MODEL
).to("cuda")

query_model.eval()


# --------------------------------------------------
# 5. Load MedCPT Cross-Encoder
# --------------------------------------------------

print("Loading MedCPT Cross-Encoder...")

reranker_tokenizer = AutoTokenizer.from_pretrained(
    RERANKER_MODEL
)

reranker_model = AutoModelForSequenceClassification.from_pretrained(
    RERANKER_MODEL
).to("cuda")

reranker_model.eval()


print("Both MedCPT models loaded!")


# --------------------------------------------------
# 6. Run actual project retrieval pipeline
# --------------------------------------------------

print("\nRunning retrieve_and_rerank()...")

results = retrieve_and_rerank(
    query=QUERY,
    bm25=bm25,
    query_tokenizer=query_tokenizer,
    query_model=query_model,
    faiss_index=faiss_index,
    reranker_tokenizer=reranker_tokenizer,
    reranker_model=reranker_model,
    corpus=corpus,
    device="cuda",
    candidate_k=10,
    top_k=5
)


# --------------------------------------------------
# 7. Display final results
# --------------------------------------------------

print("\n========================================")
print("FULL RETRIEVAL + RERANKING SUCCESSFUL!")
print("========================================")

print("\nQuery:", QUERY)

for rank, result in enumerate(results, start=1):

    print(f"\nRank {rank}")
    print("Index:", result["index"])
    print("Score:", result["score"])
    print("PMID:", result["pmid"])
    print("Title:", result["title"])


print(
    "\nCUDA memory used:",
    round(
        torch.cuda.memory_allocated() / 1024**2,
        1
    ),
    "MB"
)