# MediSphere

## Evidence-Grounded Medical Retrieval-Augmented Generation for Clinical Decision Support

MediSphere is a research-oriented medical Retrieval-Augmented Generation (RAG) platform designed to provide evidence-grounded clinical information by retrieving relevant biomedical literature, reranking the evidence, verifying evidence strength, and generating answers with traceable PubMed citations.

The system is designed as a **clinical decision-support research prototype**. It is intended to support clinicians and researchers, not replace clinical judgment.

---

# 1. System Overview

MediSphere follows this pipeline:

Clinical Question
        ↓
BM25 Keyword Retrieval + MedCPT Dense Retrieval
        ↓
Reciprocal Rank Fusion (RRF)
        ↓
MedCPT Cross-Encoder Reranking
        ↓
Evidence Verification
        ↓
Qwen2.5-7B-Instruct
        ↓
Grounded Answer + PubMed Citations

The current local corpus contains approximately **39,994 PubMed abstracts**.

---

# 2. Main Components

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Three Fiber
- Drei
- Framer Motion
- Lucide icons

Main routes:

- `/` — Landing page
- `/workspace` — Clinical Workspace
- `/evidence` — Evidence Library
- `/patients` — Patient Lookup
- `/about` — About MediSphere

## Backend

- FastAPI
- Python
- SQLite
- FAISS
- BM25
- Hugging Face Transformers

## Medical Retrieval

- `ncbi/MedCPT-Query-Encoder`
- `ncbi/MedCPT-Article-Encoder`
- `ncbi/MedCPT-Cross-Encoder`
- FAISS dense retrieval
- BM25 lexical retrieval
- Reciprocal Rank Fusion
- Cross-encoder reranking

## Generation

- Qwen2.5-7B-Instruct
- GGUF quantized model
- llama.cpp server

---

# 3. Repository Structure

```text
MEDIRAG/
│
├── app/                    # Next.js application routes
├── src/                    # Frontend components, services and types
│
├── backend/                # FastAPI application
├── retrieval/              # BM25, dense retrieval and RRF
├── reranking/              # MedCPT cross-encoder reranking
├── evidence/               # Evidence verification
├── generation/             # Grounded answer generation
├── citations/              # Citation construction
├── patient_data/           # Synthetic patient database
│
├── pipeline.py             # Main MediRAG pipeline
├── config.py               # Project configuration
├── requirements.txt        # Python dependencies
├── package.json            # Frontend dependencies
├── pnpm-lock.yaml          # Locked frontend dependency versions
│
├── data/
│   └── pubmed_corpus/      # Large runtime corpus (download separately)
│
├── artifacts/              # Generated retrieval indexes (download separately)
│
└── README.md
4. Requirements
Frontend
Node.js
pnpm

The current development environment uses:

Node.js: v23.8.0
pnpm: 11.21.0

The repository includes pnpm-lock.yaml to preserve the resolved frontend dependency versions.

Backend

Python 3.x with:

FastAPI
Uvicorn
PyTorch
Transformers
FAISS
rank-bm25
NumPy
Requests

Install the Python dependencies using:

pip install -r requirements.txt

For GPU acceleration, a compatible NVIDIA CUDA environment and CUDA-enabled PyTorch installation are recommended.

5. Runtime Resources

The complete MediSphere source code is stored in GitHub.

Large runtime resources are intentionally kept outside GitHub.

Download the following three files from the shared MediSphere Runtime Resources folder:

pubmed_abstracts_final.json
bm25_index.pkl
faiss_index.bin

Shared resource folder:

https://drive.google.com/drive/folders/1gQkBqNQgkh-Sc0MWw--G-piJkkpZACeY?usp=sharing

Place them exactly as follows:

data/
└── pubmed_corpus/
    └── pubmed_abstracts_final.json

artifacts/
├── bm25_index.pkl
└── faiss_index.bin

These files correspond to the current approximately 39,994-document PubMed corpus and its matching retrieval indexes.

Do not rename the files.

6. MedCPT Models

The backend automatically loads the following Hugging Face models:

ncbi/MedCPT-Query-Encoder
ncbi/MedCPT-Cross-Encoder

The first backend startup may download the models automatically.

Internet access is therefore required during the first model download unless the models are already available in the local Hugging Face cache.

7. Qwen2.5-7B-Instruct

MediSphere uses Qwen2.5-7B-Instruct through a local llama.cpp OpenAI-compatible server.

The current local setup uses:

Qwen2.5-7B-Instruct-Q4_K_M.gguf

The GGUF model is not stored in GitHub.

The llama.cpp server must expose:

http://127.0.0.1:8080

The generation service sends grounded evidence to the local server and receives the generated answer.

8. Starting MediSphere

Three services are required for the complete local system.

Terminal 1 — FastAPI Backend

From the project root:

python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000

The backend loads:

PubMed corpus
BM25 index
FAISS index
MedCPT Query Encoder
MedCPT Cross-Encoder

Expected:

MediRAG pipeline ready
Terminal 2 — llama.cpp / Qwen Server

Start the llama.cpp server using the locally downloaded Qwen GGUF model.

Example:

.\llama-server.exe `
-m "PATH_TO_QWEN_MODEL\Qwen2.5-7B-Instruct-Q4_K_M.gguf" `
-ngl 99 `
-c 4096 `
--host 127.0.0.1 `
--port 8080

The exact llama-server.exe path depends on the local llama.cpp installation.

Terminal 3 — Next.js Frontend

From the project root:

pnpm install
pnpm dev

Open:

http://localhost:3000
9. Environment Configuration

The frontend API URL can be configured using:

.env.local

Example:

NEXT_PUBLIC_API_URL=http://localhost:8000

Do not commit .env or .env.local files containing secrets.

10. Patient Lookup

MediSphere includes a small synthetic SQLite patient database for demonstrating controlled patient-context integration.

The current demo patients are stored in:

patient_data/patients.db

Patient information is synthetic/demo data and does not represent real patient records.

The patient context is displayed separately from the medical literature retrieval query. Patient information is not automatically injected into the RAG query.

11. API Endpoints

The FastAPI backend provides:

GET  /
GET  /health
POST /query
GET  /patients
GET  /patients?search=<query>
GET  /patients/<patient_id>

The main medical query endpoint is:

POST /query

Example request:

{
  "question": "What are cardiovascular complications of chronic kidney disease?"
}
12. Evidence Verification

The current prototype uses:

Candidate K: 10
Final K: 5
RRF K: 60
Evidence threshold: 5.0
Minimum verified evidence: 2
Maximum generated tokens: 400

These are prototype configuration values and are not clinically validated thresholds.

If insufficient supporting evidence is retrieved, MediSphere returns:

Insufficient evidence in the retrieved sources.

The system is intentionally designed to avoid generating an unsupported answer when the evidence gate is not satisfied.

13. Evaluation

The project includes evaluation scripts for retrieval and PubMedQA experiments.

Relevant files include:

evaluation.py
retrieval_evaluation.py
pubmedqa_eval.py
pipeline_retrieval_test.py
verification_test.py
full_retrieval_test.py

Evaluation metrics used in the project include:

Recall@K
MRR
MAP
nDCG
Accuracy
Macro-F1

A PubMedQA baseline evaluation was also performed using the local Qwen model.

Important:

The reported PubMedQA baseline is a Qwen-only baseline and should not be interpreted as MediSphere RAG accuracy.

14. Research Architecture
                 Clinical Question
                        │
             ┌──────────┴──────────┐
             │                     │
          BM25              MedCPT Dense
       Retrieval             Retrieval
             │                     │
             └──────────┬──────────┘
                        │
                       RRF
                        │
                        ▼
              MedCPT Cross-Encoder
                   Reranking
                        │
                        ▼
              Evidence Verification
                   │          │
                   │          └── Insufficient Evidence
                   ▼
              Qwen2.5-7B
              Grounded Generation
                        │
                        ▼
              Answer + Citations
15. Safety and Scope

MediSphere is a research prototype for evidence-grounded clinical decision support.

It is not a replacement for:

physician judgment
clinical examination
institutional protocols
medical guidelines
professional medical advice

The current patient data is synthetic.

Production deployment would require additional:

authentication
authorization
privacy controls
audit logging
secure EHR/FHIR integration
clinical validation
monitoring
regulatory review
security testing
16. Current Project Status

The current prototype includes:

Hybrid biomedical retrieval
BM25 retrieval
MedCPT dense retrieval
Reciprocal Rank Fusion
MedCPT cross-encoder reranking
Evidence verification
Grounded Qwen generation
PubMed citations
Insufficient-evidence handling
Evidence Library
Clinical Workspace
Patient Lookup
Synthetic patient-context integration
Evidence Trail
Responsive frontend
Backend error handling
Retrieval and QA evaluation
17. Important Runtime Notes

The complete system requires all three services:

Next.js Frontend      :3000
FastAPI Backend       :8000
llama.cpp / Qwen      :8080

The large PubMed corpus and retrieval indexes must be present locally before starting the FastAPI backend.

The Qwen GGUF model must be available locally before starting llama.cpp.

The first startup of the backend may take several minutes because the corpus, retrieval indexes, and MedCPT models are loaded into memory.

18. Project Purpose

MediSphere demonstrates how hybrid information retrieval, biomedical reranking, evidence verification, and grounded language generation can be combined to build an evidence-oriented medical information system.

The primary design principle is:

Retrieve → Rank → Verify → Generate → Cite

### Then save and close Notepad.

**Don't run Git commands yet.**

After saving, run:

```powershell
Get-Content README.md -TotalCount 20

Send me the output just to confirm the new README saved correctly.