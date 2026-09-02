import json
import os

CORPUS_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "data",
    "pubmed_corpus",
    "pubmed_abstracts.json"
)

with open(CORPUS_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

pmids = [str(x.get("pmid", "")) for x in data]

duplicate_pmids = len(pmids) - len(set(pmids))
missing_pmids = sum(not x.get("pmid") for x in data)
missing_titles = sum(not x.get("title", "").strip() for x in data)
missing_abstracts = sum(not x.get("abstract", "").strip() for x in data)
invalid_records = sum(
    not isinstance(x, dict) for x in data
)

print("\n==============================")
print("PUBMED CORPUS VALIDATION")
print("==============================")

print(f"Total records       : {len(data)}")
print(f"Unique PMIDs        : {len(set(pmids))}")
print(f"Duplicate PMIDs     : {duplicate_pmids}")
print(f"Missing PMIDs       : {missing_pmids}")
print(f"Missing titles      : {missing_titles}")
print(f"Missing abstracts   : {missing_abstracts}")
print(f"Invalid records     : {invalid_records}")

print("\nSample record:")
print(json.dumps(data[0], indent=2, ensure_ascii=False))

print("\n==============================")
print("VALIDATION COMPLETE")
print("==============================")