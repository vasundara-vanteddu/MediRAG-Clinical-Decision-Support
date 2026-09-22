from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter()


class QueryRequest(BaseModel):
    question: str


@router.post("/query")
def query_medical_information(request: QueryRequest):
    """
    Placeholder for the MediSphere AI pipeline.

    The actual retrieval → reranking → verification →
    generation pipeline will be connected later.
    """

    return {
        "answer": "Pipeline not connected yet.",
        "citations": [],
        "insufficient_evidence": False
    }