from pathlib import Path


# --------------------------------------------------
# Project paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent

DATA_DIR = PROJECT_ROOT / "data"

ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"


# --------------------------------------------------
# Model names
# --------------------------------------------------

MEDCPT_QUERY_MODEL = "ncbi/MedCPT-Query-Encoder"

MEDCPT_ARTICLE_MODEL = "ncbi/MedCPT-Article-Encoder"

MEDCPT_RERANKER_MODEL = "ncbi/MedCPT-Cross-Encoder"

LLM_MODEL = "Qwen/Qwen2.5-7B-Instruct"


# --------------------------------------------------
# Retrieval configuration
# --------------------------------------------------

DEFAULT_CANDIDATE_K = 10

DEFAULT_TOP_K = 5

RRF_K = 60


# --------------------------------------------------
# Evidence verification
# --------------------------------------------------

EVIDENCE_THRESHOLD = 5.0

MIN_EVIDENCE = 2


# --------------------------------------------------
# Generation
# --------------------------------------------------

MAX_NEW_TOKENS = 400

# --------------------------------------------------
# Retrieval artifacts
# --------------------------------------------------

CORPUS_PATH = DATA_DIR / "pubmed_corpus" / "pubmed_abstracts_final.json"

BM25_INDEX_PATH = ARTIFACTS_DIR / "bm25_index.pkl"

FAISS_INDEX_PATH = ARTIFACTS_DIR / "faiss_index.bin"