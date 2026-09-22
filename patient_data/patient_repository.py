import json
import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).parent / "patients.db"


def get_all_patients():
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute(
            "SELECT id, age, conditions FROM patients ORDER BY id"
        ).fetchall()

    return [
        {
            "id": row[0],
            "age": row[1],
            "conditions": json.loads(row[2]),
        }
        for row in rows
    ]


def search_patients(query: str = ""):
    patients = get_all_patients()

    query = query.strip().lower()

    if not query:
        return patients

    return [
        patient
        for patient in patients
        if query in patient["id"].lower()
        or query in str(patient["age"])
        or any(
            query in condition.lower()
            for condition in patient["conditions"]
        )
    ]


def get_patient(patient_id: str):
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT id, age, conditions FROM patients WHERE id = ?",
            (patient_id,),
        ).fetchone()

    if row is None:
        return None

    return {
        "id": row[0],
        "age": row[1],
        "conditions": json.loads(row[2]),
    }