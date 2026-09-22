import json
import pickle
from pathlib import Path

import faiss


def load_corpus(path):
    """
    Load the PubMed JSON corpus.
    """

    path = Path(path)

    with path.open("r", encoding="utf-8") as f:
        corpus = json.load(f)

    return corpus


def load_bm25(path):
    """
    Load the saved BM25 index.
    """

    path = Path(path)

    with path.open("rb") as f:
        return pickle.load(f)


def load_faiss_index(path):
    """
    Load the saved FAISS index.
    """

    path = Path(path)

    return faiss.read_index(str(path))