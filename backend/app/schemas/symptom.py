from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SymptomAnalyzeRequest(BaseModel):
    symptoms: List[str]
    duration: str = "1-2 days"
    severity: str = "Moderate"
    patient_notes: Optional[str] = None

class SymptomAnalyzeResponse(BaseModel):
    risk_level: str
    category: str
    color: str
    summary: str
    red_flags: List[str]
    possible_explanations: List[Dict[str, Any]]
    recommended_specialties: List[str]
    related_symptoms_to_watch: List[str]
    questions_for_doctor: List[str]
    disclaimer: str

class SymptomSessionResponse(BaseModel):
    id: int
    patient_id: int
    symptoms_json: str
    duration: str
    severity: str
    risk_level: str
    assessment_result: str
    created_at: datetime

    class Config:
        from_attributes = True

class SymptomAutocompleteResponse(BaseModel):
    suggestions: List[Dict[str, Any]]
