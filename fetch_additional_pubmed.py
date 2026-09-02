import json
import os
import time
import requests
import xml.etree.ElementTree as ET

# ==============================
# SETTINGS
# ==============================

TARGET_ADDITIONAL = 20000
BATCH_SIZE = 200

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CORPUS_DIR = os.path.join(BASE_DIR, "data", "pubmed_corpus")

EXISTING_FILE = os.path.join(CORPUS_DIR, "pubmed_abstracts.json")
NEW_FILE = os.path.join(CORPUS_DIR, "additional_pubmed_abstracts.json")

# ==============================
# ENTER YOUR DETAILS
# ==============================

API_KEY = input("Enter your NCBI API key: ").strip()
EMAIL = input("Enter your email: ").strip()

# ==============================
# LOAD EXISTING CORPUS
# ==============================

with open(EXISTING_FILE, "r", encoding="utf-8") as f:
    existing = json.load(f)

existing_pmids = {
    str(item["pmid"])
    for item in existing
    if "pmid" in item
}

print(f"\nExisting abstracts: {len(existing)}")
print(f"Existing PMIDs: {len(existing_pmids)}")

# ==============================
# SEARCH FOR ADDITIONAL PMIDs
# ==============================

queries = [
    "medicine",
    "clinical medicine",
    "medical diagnosis",
    "medical treatment",
    "disease",
    "drug therapy",
    "clinical research",
    "patient care",
    "public health",
    "biomedical research",
]

all_pmids = []

print("\nSearching PubMed...")

for query in queries:

    params = {
        "db": "pubmed",
        "term": query,
        "retmax": 5000,
        "retmode": "json",
        "tool": "MediRAG",
        "email": EMAIL,
        "api_key": API_KEY,
    }

    try:
        response = requests.get(
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
            params=params,
            timeout=60,
        )

        response.raise_for_status()

        data = response.json()
        ids = data["esearchresult"]["idlist"]

        print(f"{query}: {len(ids)} PMIDs")

        all_pmids.extend(ids)

        time.sleep(0.4)

    except requests.RequestException as e:
        print(f"Search failed for '{query}': {e}")

# ==============================
# REMOVE DUPLICATES
# ==============================

unique_pmids = list(dict.fromkeys(all_pmids))

# Remove PMIDs already in existing corpus
new_pmids = [
    pmid for pmid in unique_pmids
    if str(pmid) not in existing_pmids
]

print(f"\nUnique PMIDs found: {len(unique_pmids)}")
print(f"New PMIDs available: {len(new_pmids)}")

if len(new_pmids) == 0:
    print("No new PMIDs available.")
    exit()

new_pmids = new_pmids[:TARGET_ADDITIONAL]

print(f"PMIDs selected for fetching: {len(new_pmids)}")

# ==============================
# FETCH ABSTRACTS
# ==============================

new_records = []

print("\nFetching additional abstracts...")

for start in range(0, len(new_pmids), BATCH_SIZE):

    batch = new_pmids[start:start + BATCH_SIZE]

    data = {
        "db": "pubmed",
        "id": ",".join(batch),
        "retmode": "xml",
        "tool": "MediRAG",
        "email": EMAIL,
        "api_key": API_KEY,
    }

    success = False

    for attempt in range(1, 6):

        try:

            response = requests.post(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
                data=data,
                timeout=120,
            )

            response.raise_for_status()

            root = ET.fromstring(response.text)

            batch_records = []

            for article in root.findall(".//PubmedArticle"):

                pmid_element = article.find(".//PMID")

                if pmid_element is None:
                    continue

                pmid = pmid_element.text

                title_element = article.find(".//ArticleTitle")
                title = (
                    "".join(title_element.itertext())
                    if title_element is not None
                    else ""
                )

                abstract_parts = []

                for abstract_text in article.findall(".//AbstractText"):
                    text = "".join(abstract_text.itertext())

                    label = abstract_text.attrib.get("Label")

                    if label:
                        text = f"{label}: {text}"

                    abstract_parts.append(text)

                abstract = " ".join(abstract_parts).strip()

                if not abstract:
                    continue

                batch_records.append({
                    "pmid": pmid,
                    "title": title,
                    "abstract": abstract,
                })

            new_records.extend(batch_records)

            print(
                f"Fetched {min(start + BATCH_SIZE, len(new_pmids))}"
                f"/{len(new_pmids)} | "
                f"Abstracts collected: {len(new_records)}"
            )

            success = True
            break

        except (requests.RequestException, ET.ParseError) as e:

            print(
                f"Attempt {attempt}/5 failed: {e}"
            )

            if attempt < 5:
                wait_time = 2 ** attempt
                print(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)

    if not success:
        print("Skipping this batch after 5 failed attempts.")

    time.sleep(0.4)

# ==============================
# SAVE ADDITIONAL CORPUS
# ==============================

os.makedirs(CORPUS_DIR, exist_ok=True)

with open(NEW_FILE, "w", encoding="utf-8") as f:
    json.dump(
        new_records,
        f,
        ensure_ascii=False,
        indent=2
    )

print("\n==============================")
print("ADDITIONAL PUBMED FETCH DONE")
print("==============================")
print(f"Existing abstracts: {len(existing)}")
print(f"New abstracts: {len(new_records)}")
print(f"Combined total: {len(existing) + len(new_records)}")
print(f"Saved to: {NEW_FILE}")