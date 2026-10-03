from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class HealthMetricCreate(BaseModel):
    metric_type: str # "heart_rate", "bp_systolic", "bp_diastolic", "blood_glucose", "weight", "temperature", "water_ml", "sleep_hours", "steps"
    value: float
    unit: str
    recorded_at: Optional[datetime] = None
    notes: Optional[str] = None

class HealthMetricResponse(BaseModel):
    id: int
    patient_id: int
    metric_type: str
    value: float
    unit: str
    recorded_at: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class HealthRecordResponse(BaseModel):
    id: int
    patient_id: int
    category: str
    title: str
    file_url: str
    file_type: str
    file_size_kb: float
    ai_summary: Optional[str] = None
    ai_questions: Optional[str] = None
    doctor_notes: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class MedicationCreate(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    reminder_time: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    refills_left: int = 1
    notes: Optional[str] = None

class MedicationUpdate(BaseModel):
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    reminder_time: Optional[str] = None
    refills_left: Optional[int] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class MedicationLogCreate(BaseModel):
    medication_id: int
    status: str = "taken" # "taken", "skipped"

class MedicationLogResponse(BaseModel):
    id: int
    medication_id: int
    patient_id: int
    scheduled_time: str
    logged_at: datetime
    status: str

    class Config:
        from_attributes = True

class MedicationResponse(BaseModel):
    id: int
    patient_id: int
    medicine_name: str
    dosage: str
    frequency: str
    reminder_time: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    refills_left: int
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    logs: List[MedicationLogResponse] = []

    class Config:
        from_attributes = True
