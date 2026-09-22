import json
import pickle
import torch
import faiss

from transformers import AutoTokenizer, AutoModel
from transformers import AutoModelForSequenceClassification

from pipeline import MediRAGPipeline


# -----------------------------
# Paths
# -----------------------------

CORPUS_PATH = "data/pubmed_corpus/pubmed_abstracts_final.json"
BM25_PATH = "artifacts/bm25_index.pkl"
FAISS_PATH = "artifacts/faiss_index.bin"

QUERY_MODEL = "ncbi/MedCPT-Query-Encoder"
RERANKER_MODEL = "ncbi/MedCPT-Cross-Encoder"


# -----------------------------
# Load data
# -----------------------------

print("Loading corpus...")

with open(CORPUS_PATH, "r", encoding="utf-8") as f:
    corpus = json.load(f)

print("Corpus:", len(corpus))


print("Loading BM25...")

with open(BM25_PATH, "rb") as f:
    bm25 = pickle.load(f)

print("BM25 documents:", len(bm25.doc_freqs))


print("Loading FAISS...")

faiss_index = faiss.read_index(FAISS_PATH)

print(
    "FAISS:",
    faiss_index.ntotal,
    "vectors ×",
    faiss_index.d,
    "dimensions"
)


# -----------------------------
# Load MedCPT models
# -----------------------------

print("\nLoading MedCPT Query Encoder...")

query_tokenizer = AutoTokenizer.from_pretrained(
    QUERY_MODEL
)

query_model = AutoModel.from_pretrained(
    QUERY_MODEL
).to("cuda")

query_model.eval()


print("Loading MedCPT Cross-Encoder...")

reranker_tokenizer = AutoTokenizer.from_pretrained(
    RERANKER_MODEL
)

reranker_model = AutoModelForSequenceClassification.from_pretrained(
    RERANKER_MODEL
).to("cuda")

reranker_model.eval()


# -----------------------------
# Create pipeline
# -----------------------------

print("\nCreating MediRAGPipeline...")

pipeline = MediRAGPipeline(

    bm25=bm25,

    query_tokenizer=query_tokenizer,

    query_model=query_model,

    faiss_index=faiss_index,

    reranker_tokenizer=reranker_tokenizer,

    reranker_model=reranker_model,

    corpus=corpus,

    device="cuda",

    candidate_k=10,

    top_k=5,

    evidence_threshold=5.0,

    min_evidence=2

)

print("Pipeline created successfully!")


# -----------------------------
# Test retrieval + verification
# -----------------------------

QUERY = "polycystic ovary syndrome cardiovascular risk"

print("\nRunning pipeline retrieval...")

results = pipeline.retrieve_and_rerank if False else None

# Directly test the same components used by the pipeline.
from retrieval.reranked_retrieval import retrieve_and_rerank
from evidence.verification import verify_evidence

retrieved = retrieve_and_rerank(
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

verified, insufficient = verify_evidence(
    retrieved,
    threshold=5.0,
    min_evidence=2
)
# -----------------------------
# Test grounded Qwen generation
# -----------------------------

print("\nGenerating grounded answer with Qwen...")

if insufficient:
    answer = "Insufficient evidence in the retrieved sources."
else:
    from generation.llm import generate_grounded_answer

    answer = generate_grounded_answer(
        query=QUERY,
        evidence_results=verified,
        max_new_tokens=300
    )

print("\n========================================")
print("GROUNDED QWEN ANSWER")
print("========================================")
print(answer)


# -----------------------------
# Test citation builder
# -----------------------------

from citations.citation_builder import build_citations

citations = build_citations(verified)

print("\n========================================")
print("CITATIONS")
print("========================================")

for citation in citations:
    print("PMID:", citation["pmid"])
    print("Title:", citation["title"])
    print()

# -----------------------------
# Results
# -----------------------------

print("\n========================================")
print("PIPELINE RETRIEVAL + VERIFICATION TEST")
print("========================================")

print("Query:", QUERY)
print("Retrieved:", len(retrieved))
print("Verified:", len(verified))
print("Insufficient evidence:", insufficient)

for rank, result in enumerate(verified, start=1):
    print(f"\nRank {rank}")
    print("PMID:", result["pmid"])
    print("Score:", result["score"])
    print("Title:", result["title"])


print(
    "\nCUDA memory used:",
    round(torch.cuda.memory_allocated() / 1024**2, 1),
    "MB"
)

print("\n========================================")
print("PIPELINE RETRIEVAL TEST SUCCESSFUL!")
print("========================================")