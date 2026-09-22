from retrieval.bm25 import bm25_search
from retrieval.dense_retrieval import dense_search
from retrieval.hybrid_rrf import reciprocal_rank_fusion


def hybrid_retrieve(
    query,
    bm25,
    query_tokenizer,
    query_model,
    faiss_index,
    device,
    candidate_k=10
):
    """
    Perform BM25 + dense retrieval followed by RRF.
    """

    # ----------------------------------------------
    # 1. BM25 retrieval
    # ----------------------------------------------

    bm25_indices = bm25_search(
        bm25,
        query,
        top_k=candidate_k
    )

    # ----------------------------------------------
    # 2. Dense MedCPT retrieval
    # ----------------------------------------------

    dense_results = dense_search(
        query,
        query_tokenizer,
        query_model,
        faiss_index,
        device,
        top_k=candidate_k
    )

    dense_indices = [
        idx
        for idx, score in dense_results
    ]

    # ----------------------------------------------
    # 3. Reciprocal Rank Fusion
    # ----------------------------------------------

    rrf_results = reciprocal_rank_fusion(
        [
            bm25_indices.tolist(),
            dense_indices
        ]
    )

    return rrf_results[:candidate_k]