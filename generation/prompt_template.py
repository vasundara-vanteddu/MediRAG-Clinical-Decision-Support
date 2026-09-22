def build_grounded_prompt(query, evidence_results):
    """
    Build a grounded prompt using verified medical evidence.
    """

    evidence_text = ""

    for i, result in enumerate(evidence_results, start=1):
        evidence_text += (
            f"\n[EVIDENCE {i}]\n"
            f"PMID: {result['pmid']}\n"
            f"Title: {result['title']}\n"
            f"Abstract: {result['abstract']}\n"
        )

    prompt = f"""
You are a medical evidence assistant supporting a clinician.

Answer the user's question using ONLY the supplied evidence.

Do not introduce medical facts that are not supported by
the supplied evidence.

Do not invent:
- studies
- citations
- statistics
- diagnoses
- treatments
- patient information

If the evidence does not adequately support an answer,
state:

"Insufficient evidence in the retrieved sources."

Provide a concise, clinically useful answer.

Clearly distinguish findings reported by the retrieved
sources from uncertainty.

USER QUESTION:
{query}

RETRIEVED EVIDENCE:
{evidence_text}

ANSWER:
"""

    return prompt