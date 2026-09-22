import re
import pickle
import numpy as np
from rank_bm25 import BM25Okapi


def tokenize(text):
    """
    Simple tokenizer for biomedical text.
    """
    return re.findall(r"\b\w+\b", text.lower())


def build_bm25_index(corpus):
    """
    Build a BM25 index from the PubMed corpus.

    Each document should contain:
        pmid
        title
        abstract
    """

    tokenized_corpus = []

    for doc in corpus:
        text = f"{doc['title']} {doc['abstract']}"
        tokenized_corpus.append(tokenize(text))

    return BM25Okapi(tokenized_corpus)


def bm25_search(bm25, query, top_k=10):
    """
    Retrieve the top-k documents using BM25.

    Returns:
        numpy array containing document indices.
    """

    query_tokens = tokenize(query)

    scores = bm25.get_scores(query_tokens)

    top_indices = np.argsort(scores)[::-1][:top_k]

    return top_indices


def save_bm25_index(bm25, path):
    """
    Save BM25 index to disk.
    """
    with open(path, "wb") as f:
        pickle.dump(bm25, f)


def load_bm25_index(path):
    """
    Load BM25 index from disk.
    """
    with open(path, "rb") as f:
        return pickle.load(f)