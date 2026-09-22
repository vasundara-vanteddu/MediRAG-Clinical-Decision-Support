import json
import pickle

import faiss
import torch

from transformers import (
    AutoTokenizer,
    AutoModel,
    AutoModelForSequenceClassification,
)

from pipeline import MediRAGPipeline
from backend.main import create_app


# --------------------------------------------------
# Paths
# --------------------------------------------------

CORPUS_PATH = "data/pubmed_corpus/pubmed_abstracts_final.json"
BM25_PATH = "artifacts/bm25_index.pkl"
FAISS_PATH = "artifacts/faiss_index.bin"

QUERY_MODEL = "ncbi/MedCPT-Query-Encoder"
RERANKER_MODEL = "ncbi/MedCPT-Cross-Encoder"


# --------------------------------------------------
# Load PubMed corpus
# --------------------------------------------------

print("Loading PubMed corpus...")

with open(CORPUS_PATH, "r", encoding="utf-8") as f:
    corpus = json.load(f)

print(f"Corpus loaded: {len(corpus)} documents")


# --------------------------------------------------
# Load BM25
# --------------------------------------------------

print("Loading BM25 index...")

with open(BM25_PATH, "rb") as f:
    bm25 = pickle.load(f)

print(f"BM25 loaded: {len(bm25.doc_freqs)} documents")


# --------------------------------------------------
# Load FAISS
# --------------------------------------------------

print("Loading FAISS index...")

faiss_index = faiss.read_index(FAISS_PATH)

print(
    f"FAISS loaded: "
    f"{faiss_index.ntotal} vectors × {faiss_index.d} dimensions"
)


# --------------------------------------------------
# Select device
# --------------------------------------------------

device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Using device: {device}")


# --------------------------------------------------
# Load MedCPT Query Encoder
# --------------------------------------------------

print("Loading MedCPT Query Encoder...")

query_tokenizer = AutoTokenizer.from_pretrained(
    QUERY_MODEL
)

query_model = AutoModel.from_pretrained(
    QUERY_MODEL
).to(device)

query_model.eval()

print("Query Encoder loaded")


# --------------------------------------------------
# Load MedCPT Cross-Encoder
# --------------------------------------------------

print("Loading MedCPT Cross-Encoder...")

reranker_tokenizer = AutoTokenizer.from_pretrained(
    RERANKER_MODEL
)

reranker_model = AutoModelForSequenceClassification.from_pretrained(
    RERANKER_MODEL
).to(device)

reranker_model.eval()

print("Cross-Encoder loaded")


# --------------------------------------------------
# Create MediRAG Pipeline
# --------------------------------------------------

print("Creating MediRAG pipeline...")

pipeline = MediRAGPipeline(
    bm25=bm25,
    query_tokenizer=query_tokenizer,
    query_model=query_model,
    faiss_index=faiss_index,
    reranker_tokenizer=reranker_tokenizer,
    reranker_model=reranker_model,
    corpus=corpus,
    device=device,
    candidate_k=10,
    top_k=5,
    evidence_threshold=5.0,
    min_evidence=2,
)

print("MediRAG pipeline ready")


# --------------------------------------------------
# Create FastAPI application
# --------------------------------------------------

app = create_app(pipeline)