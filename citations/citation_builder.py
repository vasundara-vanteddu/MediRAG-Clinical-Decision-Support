def build_citations(evidence_results):
    citations = []

    for rank, result in enumerate(evidence_results, start=1):
        citations.append(
            {
                "pmid": str(result["pmid"]),
                "title": result["title"],
                "abstract": result["abstract"],
                "score": float(result["score"]),
                "rank": rank,
            }
        )

    return citations