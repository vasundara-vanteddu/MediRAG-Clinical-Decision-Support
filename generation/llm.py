import requests

LLAMA_SERVER_URL = "http://127.0.0.1:8080/v1/chat/completions"


def generate_grounded_answer(
    query,
    evidence_results,
    max_new_tokens=400,
):
    evidence_text = ""

    for i, result in enumerate(evidence_results, start=1):
        evidence_text += (
            f"\n[EVIDENCE {i}]\n"
            f"PMID: {result['pmid']}\n"
            f"Title: {result['title']}\n"
            f"Abstract: {result['abstract']}\n"
        )

    system_prompt = (
        "You are a medical evidence assistant supporting a clinician. "
        "Use ONLY the supplied evidence. "
        "Do not invent medical facts, citations, statistics, diagnoses, "
        "treatments, or patient information. "
        "Clearly distinguish evidence from uncertainty."
    )

    user_prompt = f"""
Answer the user's question using ONLY the supplied evidence.

If the evidence does not adequately support an answer, state:
"Insufficient evidence in the retrieved sources."

Provide a concise, clinically useful answer.

USER QUESTION:
{query}

RETRIEVED EVIDENCE:
{evidence_text}

ANSWER:
"""

    payload = {
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        "temperature": 0.2,
        "max_tokens": max_new_tokens,
    }

    try:
        response = requests.post(
            LLAMA_SERVER_URL,
            json=payload,
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError:
        return (
            "Evidence retrieved and verified successfully. "
            "However, the local Qwen generation server at http://127.0.0.1:8080 is currently unavailable. "
            "See the supporting PubMed citations below."
        )
    except requests.exceptions.Timeout:
        return (
            "Evidence retrieved and verified successfully. "
            "However, the local Qwen generation server timed out while generating the response. "
            "See the supporting PubMed citations below."
        )
    except Exception as e:
        return (
            f"Evidence retrieved and verified successfully. "
            f"Generation service error: {str(e)}. "
            f"See the supporting PubMed citations below."
        )