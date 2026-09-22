from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from pipeline import MediRAGPipeline

from patient_data.patient_repository import (
    get_all_patients,
    get_patient,
    search_patients,
)

class QueryRequest(BaseModel):
    question: str


def create_app(pipeline: MediRAGPipeline):
    app = FastAPI(
        title="MediSphere API",
        description=(
            "Evidence-Grounded Medical Retrieval-Augmented "
            "Generation API for Clinical Decision Support."
        ),
        version="1.0.0"
    )
    app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    @app.get("/")
    def root():
        return {
            "name": "MediSphere API",
            "status": "running"
        }

    @app.get("/health")
    def health():
        return {
            "status": "healthy"
        }
    
    @app.get("/patients")
    def list_patients(search: str = ""):
        return search_patients(search)

    @app.get("/patients/{patient_id}")
    def patient_details(patient_id: str):
        patient = get_patient(patient_id)

        if patient is None:
            return {
                "error": "Patient not found"
            }

        return patient

    @app.post("/query")
    def query_medical_information(request: QueryRequest):
        return pipeline.query(request.question)

    return app