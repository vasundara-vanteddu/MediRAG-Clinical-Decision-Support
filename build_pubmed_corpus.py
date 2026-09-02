import json
import os
import time
import requests
import xml.etree.ElementTree as ET
from requests.exceptions import RequestException

# =========================
# GET NCBI DETAILS
# =========================

API_KEY = input("Enter your NCBI API key: ").strip()
EMAIL = input("Enter your email: ").strip()

# =========================
# CONFIGURATION
# =========================

TARGET_PMIDS = 50000
BATCH_SIZE = 200
MAX_RETRIES = 5

OUTPUT_DIR = "data/pubmed_corpus"

PMID_FILE = os.path.join(
    OUTPUT_DIR,
    "pmids.json"
)

CHECKPOINT_FILE = os.path.join(
    OUTPUT_DIR,
    "pubmed_abstracts.jsonl"
)

FINAL_FILE = os.path.join(
    OUTPUT_DIR,
    "pubmed_abstracts.json"
)

QUERIES = [
    "medicine",
    "clinical medicine",
    "medical diagnosis",
    "disease treatment",
    "clinical research",
    "pharmacology",
    "cardiology",
    "oncology",
    "neurology",
    "infectious diseases"
]

os.makedirs(OUTPUT_DIR, exist_ok=True)

session = requests.Session()


# =========================
# SEARCH PUBMED
# =========================

def search_pmids(query, retmax=5000):

    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"

    params = {
        "db": "pubmed",
        "term": query,
        "retmax": retmax,
        "retmode": "json",
        "api_key": API_KEY,
        "tool": "MediRAG",
        "email": EMAIL
    }

    for attempt in range(MAX_RETRIES):

        try:

            response = session.get(
                url,
                params=params,
                timeout=60
            )

            response.raise_for_status()

            return response.json()["esearchresult"]["idlist"]

        except RequestException as e:

            print(
                f"Search failed. "
                f"Retry {attempt + 1}/{MAX_RETRIES}"
            )

            time.sleep(2 ** attempt)

    return []


# =========================
# FETCH ABSTRACTS
# =========================

def fetch_batch(pmids):

    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

    data = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml",
        "api_key": API_KEY,
        "tool": "MediRAG",
        "email": EMAIL
    }

    for attempt in range(MAX_RETRIES):

        try:

            response = session.post(
                url,
                data=data,
                timeout=120
            )

            response.raise_for_status()

            root = ET.fromstring(response.text)

            records = []

            for article in root.findall(".//PubmedArticle"):

                pmid_element = article.find(".//PMID")

                if pmid_element is None:
                    continue

                pmid = pmid_element.text

                title_element = article.find(
                    ".//ArticleTitle"
                )

                if title_element is not None:
                    title = "".join(
                        title_element.itertext()
                    )
                else:
                    title = ""

                abstract_parts = []

                for abstract_text in article.findall(
                    ".//AbstractText"
                ):

                    text = "".join(
                        abstract_text.itertext()
                    )

                    if text:
                        abstract_parts.append(text)

                abstract = " ".join(
                    abstract_parts
                )

                # Skip papers without abstracts
                if not abstract:
                    continue

                records.append({
                    "pmid": pmid,
                    "title": title,
                    "abstract": abstract
                })

            return records

        except (
            RequestException,
            ET.ParseError
        ) as e:

            print(
                f"Fetch failed. "
                f"Retry {attempt + 1}/{MAX_RETRIES}"
            )

            time.sleep(2 ** attempt)

    print("Batch failed after all retries.")

    return []


# =========================
# STEP 1: COLLECT PMIDs
# =========================

if not os.path.exists(PMID_FILE):

    all_pmids = set()

    for query in QUERIES:

        print(f"\nSearching: {query}")

        ids = search_pmids(query)

        print(f"Found: {len(ids)}")

        all_pmids.update(ids)

        time.sleep(0.5)

        if len(all_pmids) >= TARGET_PMIDS:
            break

    all_pmids = list(all_pmids)[:TARGET_PMIDS]

    with open(
        PMID_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            all_pmids,
            f
        )

    print(
        f"\nUnique PMIDs collected: "
        f"{len(all_pmids)}"
    )

else:

    with open(
        PMID_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        all_pmids = json.load(f)

    print(
        f"Loaded existing PMID list: "
        f"{len(all_pmids)}"
    )


# =========================
# STEP 2: LOAD CHECKPOINT
# =========================

processed_pmids = set()

if os.path.exists(CHECKPOINT_FILE):

    with open(
        CHECKPOINT_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        for line in f:

            try:

                record = json.loads(line)

                processed_pmids.add(
                    record["pmid"]
                )

            except:
                continue


print(
    f"Already processed: "
    f"{len(processed_pmids)}"
)


remaining_pmids = [
    pmid
    for pmid in all_pmids
    if pmid not in processed_pmids
]


print(
    f"Remaining: "
    f"{len(remaining_pmids)}"
)


# =========================
# STEP 3: FETCH + SAVE
# =========================

with open(
    CHECKPOINT_FILE,
    "a",
    encoding="utf-8"
) as f:

    for i in range(
        0,
        len(remaining_pmids),
        BATCH_SIZE
    ):

        batch = remaining_pmids[
            i:i + BATCH_SIZE
        ]

        print(
            f"\nFetching "
            f"{i + 1} - "
            f"{i + len(batch)} "
            f"/ {len(remaining_pmids)}"
        )

        records = fetch_batch(batch)

        for record in records:

            f.write(
                json.dumps(
                    record,
                    ensure_ascii=False
                ) + "\n"
            )

        # Save immediately
        f.flush()

        print(
            f"Saved "
            f"{len(records)} abstracts"
        )

        time.sleep(0.5)


# =========================
# STEP 4: CREATE FINAL JSON
# =========================

records = []

with open(
    CHECKPOINT_FILE,
    "r",
    encoding="utf-8"
) as f:

    for line in f:

        try:

            records.append(
                json.loads(line)
            )

        except:
            continue


with open(
    FINAL_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        records,
        f,
        ensure_ascii=False,
        indent=2
    )


print("\n==============================")
print("PUBMED CORPUS COMPLETED")
print("==============================")
print(
    f"Total abstracts: {len(records)}"
)
print(
    f"Saved to: {FINAL_FILE}"
)