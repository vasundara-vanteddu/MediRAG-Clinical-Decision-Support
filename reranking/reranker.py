import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


MODEL_NAME = "ncbi/MedCPT-Cross-Encoder"


def load_reranker(device=None):
    """
    Load the MedCPT biomedical cross-encoder reranker.
    """

    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME
    )

    model.to(device)
    model.eval()

    return tokenizer, model, device


def rerank_candidates(
    query,
    candidate_indices,
    corpus,
    tokenizer,
    model,
    device,
    top_k=5
):
    """
    Rerank candidate documents using the
    MedCPT Cross-Encoder.

    Parameters:
        query: Medical user query.
        candidate_indices: Document indices from hybrid retrieval.
        corpus: PubMed document corpus.
        tokenizer: MedCPT reranker tokenizer.
        model: MedCPT reranker model.
        device: CPU or CUDA.
        top_k: Number of final documents to return.

    Returns:
        Reranked evidence documents.
    """

    pairs = []

    for idx in candidate_indices:
        doc = corpus[int(idx)]

        document_text = (
            f"{doc['title']} {doc['abstract']}"
        )

        pairs.append([
            query,
            document_text
        ])

    inputs = tokenizer(
        pairs,
        padding=True,
        truncation=True,
        max_length=512,
        return_tensors="pt"
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits

    if logits.shape[-1] == 1:
        scores = logits[:, 0]
    else:
        scores = logits[:, -1]

    scores = scores.cpu().numpy()

    results = []

    for idx, score in zip(candidate_indices, scores):

        doc = corpus[int(idx)]

        results.append({
            "index": int(idx),
            "pmid": str(doc["pmid"]),
            "title": doc["title"],
            "abstract": doc["abstract"],
            "score": float(score)
        })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results[:top_k]