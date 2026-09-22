import json
import requests
import time

TEST_PATH = "data/test_set.json"
OUTPUT_PATH = "data/pubmedqa_smoke_predictions.json"

with open(TEST_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

items = list(data.items())
predictions = {}

for i, (pmid, item) in enumerate(items, start=1):
    question = item["QUESTION"]

    prompt = f"""Answer this PubMedQA question with exactly one word: yes or no.

Question:
{question}

Answer:"""

    payload = {
        "messages": [
            {
                "role": "system",
                "content": "You are a biomedical question-answering evaluator. Output only yes or no."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0,
        "max_tokens": 5
    }

    start = time.time()

    response = requests.post(
        "http://127.0.0.1:8080/v1/chat/completions",
        json=payload,
        timeout=300
    )
    response.raise_for_status()

    answer = response.json()["choices"][0]["message"]["content"].strip().lower()

    if "yes" in answer:
        prediction = "yes"
    elif "no" in answer:
        prediction = "no"
    else:
        prediction = "unknown"

    predictions[pmid] = prediction

    print(f"{i}/5 | PMID {pmid} | {prediction} | {time.time()-start:.1f}s")

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(predictions, f, indent=2)

print("\nSaved:", OUTPUT_PATH)
