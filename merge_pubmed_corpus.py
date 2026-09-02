import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CORPUS_DIR = os.path.join(BASE_DIR, "data", "pubmed_corpus")

EXISTING_FILE = os.path.join(CORPUS_DIR, "pubmed_abstracts.json")
ADDITIONAL_FILE = os.path.join(CORPUS_DIR, "additional_pubmed_abstracts.json")
FINAL_FILE = os.path.join(CORPUS_DIR, "pubmed_abstracts_final.json")


# Load original corpus
with open(EXISTING_FILE, "r", encoding="utf-8") as f:
    existing = json.load(f)

# Load additional corpus
with open(ADDITIONAL_FILE, "r", encoding="utf-8") as f:
    additional = json.load(f)

print(f"Original abstracts   : {len(existing)}")
print(f"Additional abstracts : {len(additional)}")


# Merge while removing duplicate PMIDs
merged = []
seen_pmids = set()

for record in existing + additional:
    pmid = str(record.get("pmid", "")).strip()

    if pmid and pmid not in seen_pmids:
        seen_pmids.add(pmid)
        merged.append(record)


# Save final corpus
with open(FINAL_FILE, "w", encoding="utf-8") as f:
    json.dump(
        merged,
        f,
        ensure_ascii=False,
        indent=2
    )


print("\n==============================")
print("PUBMED CORPUS MERGED")
print("==============================")
print(f"Final abstracts      : {len(merged)}")
print(f"Duplicate PMIDs removed: {len(existing) + len(additional) - len(merged)}")
print(f"Saved to             : {FINAL_FILE}")
print("==============================")