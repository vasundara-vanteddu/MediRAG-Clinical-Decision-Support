def verify_evidence(
    results,
    threshold=5.0,
    min_evidence=2
):
    """
    Verify whether retrieved evidence is strong enough
    for downstream answer generation.

    Parameters:
        results: Reranked evidence documents.
        threshold: Minimum reranker score.
        min_evidence: Minimum number of supporting documents.

    Returns:
        verified_results: Evidence documents above threshold.
        insufficient_evidence: Boolean safety flag.
    """

    verified_results = [
        result
        for result in results
        if result["score"] >= threshold
    ]

    insufficient_evidence = (
        len(verified_results) < min_evidence
    )

    return verified_results, insufficient_evidence