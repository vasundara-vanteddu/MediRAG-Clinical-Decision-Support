import json
import os
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# ==============================
# PATHS
# ==============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "pubmed_corpus",
    "pubmed_documents.json"
)

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "data",
    "pubmed_corpus",
    "faiss_index"
)

INDEX_FILE = os.path.join(OUTPUT_DIR, "pubmed.index")
IDS_FILE = os.path.join(OUTPUT_DIR, "document_ids.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==============================
# SETTINGS
# ==============================

MODEL_NAME = "NeuML/pubmedbert-base-embeddings"
BATCH_SIZE = 32

# ==============================
# LOAD DOCUMENTS
# ==============================

print("Loading PubMed documents...")

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    documents = json.load(f)

print(f"Documents loaded: {len(documents)}")

texts = [doc["text"] for doc in documents]
document_ids = [doc["doc_id"] for doc in documents]

# ==============================
# LOAD EMBEDDING MODEL
# ==============================

print("\nLoading biomedical embedding model...")
print(MODEL_NAME)

model = SentenceTransformer(MODEL_NAME)

# ==============================
# GENERATE EMBEDDINGS
# ==============================

print("\nGenerating embeddings...")

embeddings = model.encode(
    texts,
    batch_size=BATCH_SIZE,
    show_progress_bar=True,
    normalize_embeddings=True,
    convert_to_numpy=True
)

embeddings = embeddings.astype("float32")

print(f"Embedding shape: {embeddings.shape}")

# ==============================
# BUILD FAISS INDEX
# ==============================

print("\nBuilding FAISS index...")

dimension = embeddings.shape[1]

index = faiss.IndexFlatIP(dimension)

index.add(embeddings)

print(f"FAISS vectors: {index.ntotal}")

# ==============================
# SAVE INDEX
# ==============================

faiss.write_index(index, INDEX_FILE)

with open(IDS_FILE, "w", encoding="utf-8") as f:
    json.dump(document_ids, f, indent=2)

print("\n==============================")
print("FAISS INDEX BUILD COMPLETE")
print("==============================")
print(f"Documents : {len(documents)}")
print(f"Vectors   : {index.ntotal}")
print(f"Dimension : {dimension}")
print(f"Index     : {INDEX_FILE}")
print(f"IDs       : {IDS_FILE}")
print("==============================")