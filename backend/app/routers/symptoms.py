import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.symptom import SymptomSession
from app.schemas.symptom import (
    SymptomAnalyzeRequest, SymptomAnalyzeResponse,
    SymptomSessionResponse, SymptomAutocompleteResponse
)
from app.auth.dependencies import get_current_user, require_role
from app.ai.symptom_analyzer import symptom_analyzer_service
from app.dsa import symptom_trie, medical_graph
from app.utils.audit import record_audit

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])

@router.get("/autocomplete")
def autocomplete_symptoms(
    q: str = Query(..., min_length=1, description="Prefix to autocomplete, e.g. 'head'")
):
    """
    Trie-based DSA Autocomplete
    Returns instant prefix-matched symptoms sorted by clinical query frequency.
    """
    suggestions = symptom_trie.autocomplete(prefix=q, max_results=8)
    return {"query": q, "suggestions": suggestions}

@router.get("/graph/explore")
def explore_symptom_graph(
    symptom: str = Query(..., description="Symptom name to explore in clinical graph")
):
    """
    Graph DSA Exploration
    Executes Breadth-First Search (BFS) starting from the symptom to uncover connected
    conditions, co-occurring symptoms, and doctor specialties.
    """
    traversal = medical_graph.bfs_traversal(start_node=symptom, max_depth=2)
    related = medical_graph.get_related_symptoms(symptom)
    return {
        "symptom": symptom,
        "related_symptoms": related,
        "graph_connections": traversal
    }

@router.post("/analyze", response_model=SymptomAnalyzeResponse)
def analyze_symptoms(
    req: SymptomAnalyzeRequest,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    # Execute Symptom Analyzer Service
    result = symptom_analyzer_service.analyze(
        symptoms=req.symptoms,
        duration=req.duration,
        severity=req.severity,
        patient_info={
            "age": patient.age,
            "gender": patient.gender,
            "existing_conditions": patient.existing_conditions,
            "allergies": patient.allergies
        }
    )

    # Persist session to database
    session_record = SymptomSession(
        patient_id=patient.id,
        symptoms_json=json.dumps(req.symptoms),
        duration=req.duration,
        severity=req.severity,
        risk_level=result["risk_level"],
        assessment_result=json.dumps(result)
    )
    db.add(session_record)
    db.commit()

    record_audit(db, action="ANALYZE_SYMPTOMS", resource="SYMPTOMS", user_id=current_user.id, details=f"Assessed {len(req.symptoms)} symptoms")

    return result

@router.get("/history", response_model=List[SymptomSessionResponse])
def get_symptom_history(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        return []
    return (
        db.query(SymptomSession)
        .filter(SymptomSession.patient_id == patient.id)
        .order_by(SymptomSession.created_at.desc())
        .limit(20)
        .all()
    )
