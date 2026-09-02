import json
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "pubmed_corpus",
    "pubmed_abstracts_final.json"
)

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "pubmed_corpus",
    "pubmed_documents.json"
)


def clean_text(text):
    """Clean whitespace and unwanted characters."""
    text = text.replace("\n", " ")
    text = text.replace("\r", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# Load corpus
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    records = json.load(f)

documents = []

for record in records:

    pmid = str(record["pmid"]).strip()
    title = clean_text(record["title"])
    abstract = clean_text(record["abstract"])

    if not pmid or not abstract:
        continue

    # Combine title + abstract for retrieval
    text = f"{title}. {abstract}"

    documents.append({
        "doc_id": pmid,
        "pmid": pmid,
        "title": title,
        "text": text
    })


# Save processed documents
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(
        documents,
        f,
        ensure_ascii=False,
        indent=2
    )


print("\n==============================")
print("PUBMED PREPROCESSING COMPLETE")
print("==============================")
print(f"Input records      : {len(records)}")
print(f"Processed documents: {len(documents)}")
print(f"Output file        : {OUTPUT_FILE}")
print("==============================")