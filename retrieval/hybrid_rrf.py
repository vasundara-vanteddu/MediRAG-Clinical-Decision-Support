def reciprocal_rank_fusion(rank_lists, k=60):
    """
    Combine multiple ranked document lists using
    Reciprocal Rank Fusion (RRF).

    Parameters:
        rank_lists: List of ranked document-index lists.
        k: RRF constant.

    Returns:
        List of (document_index, rrf_score)
        sorted by score in descending order.
    """

    rrf_scores = {}

    for ranked_list in rank_lists:
        for rank, doc_idx in enumerate(ranked_list, start=1):
            rrf_scores[doc_idx] = (
                rrf_scores.get(doc_idx, 0)
                + 1 / (k + rank)
            )

    return sorted(
        rrf_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )