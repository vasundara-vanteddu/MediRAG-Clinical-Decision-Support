import numpy as np
import torch


def encode_query(query, tokenizer, model, device):
    """
    Convert a medical query into a MedCPT query embedding.
    """

    inputs = tokenizer(
        [query],
        padding=True,
        truncation=True,
        max_length=64,
        return_tensors="pt"
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.no_grad():
        outputs = model(**inputs)

    embedding = (
        outputs.last_hidden_state[:, 0, :]
        .cpu()
        .numpy()
        .astype("float32")
    )

    return embedding


def dense_search(
    query,
    tokenizer,
    model,
    index,
    device,
    top_k=10
):
    """
    Perform dense biomedical retrieval using
    MedCPT Query Encoder + FAISS.

    Returns:
        List of tuples:
        (document_index, similarity_score)
    """

    query_embedding = encode_query(
        query,
        tokenizer,
        model,
        device
    )

    scores, indices = index.search(
        query_embedding,
        top_k
    )

    results = []

    for idx, score in zip(indices[0], scores[0]):
        if idx != -1:
            results.append(
                (
                    int(idx),
                    float(score)
                )
            )

    return results