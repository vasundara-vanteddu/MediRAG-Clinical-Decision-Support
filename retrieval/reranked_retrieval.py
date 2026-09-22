from retrieval.interface import hybrid_retrieve
from reranking.reranker import rerank_candidates


def retrieve_and_rerank(
    query,
    bm25,
    query_tokenizer,
    query_model,
    faiss_index,
    reranker_tokenizer,
    reranker_model,
    corpus,
    device,
    candidate_k=10,
    top_k=5
):
    """
    Complete retrieval pipeline:

    BM25 + Dense Retrieval
            ↓
           RRF
            ↓
        MedCPT Reranker
            ↓
       Final Evidence
    """

    # ----------------------------------------------
    # 1. Hybrid retrieval
    # ----------------------------------------------

    rrf_results = hybrid_retrieve(
        query=query,
        bm25=bm25,
        query_tokenizer=query_tokenizer,
        query_model=query_model,
        faiss_index=faiss_index,
        device=device,
        candidate_k=candidate_k
    )

    # Extract document indices
    candidate_indices = [
        int(idx)
        for idx, score in rrf_results
    ]

    # ----------------------------------------------
    # 2. Biomedical reranking
    # ----------------------------------------------

    final_results = rerank_candidates(
        query=query,
        candidate_indices=candidate_indices,
        corpus=corpus,
        tokenizer=reranker_tokenizer,
        model=reranker_model,
        device=device,
        top_k=top_k
    )

    return final_results