from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: str # "YYYY-MM-DD"
    appointment_time: str # "10:00"
    reason: Optional[str] = "Routine consultation"
    consultation_type: str = "in_person" # "in_person", "video", "chat"
    patient_notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None # "pending", "confirmed", "completed", "cancelled"
    doctor_notes: Optional[str] = None
    prescription_notes: Optional[str] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    appointment_code: str
    patient_id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    appointment_date: str
    appointment_time: str
    status: str
    reason: Optional[str] = None
    consultation_type: str
    patient_notes: Optional[str] = None
    doctor_notes: Optional[str] = None
    prescription_notes: Optional[str] = None
    qr_code_data: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AppointmentSlotResponse(BaseModel):
    time: str
    is_booked: bool
