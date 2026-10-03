from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DoctorAvailabilityCreate(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    slot_duration_minutes: int = 30
    is_available: bool = True

class DoctorAvailabilityResponse(BaseModel):
    id: int
    doctor_id: int
    day_of_week: str
    start_time: str
    end_time: str
    slot_duration_minutes: int
    is_available: bool

    class Config:
        from_attributes = True

class DoctorProfileUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    consultation_fee: Optional[float] = None
    hospital_name: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None

class DoctorProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    specialization: str
    qualification: str
    experience_years: int
    bio: Optional[str] = None
    consultation_fee: float
    rating: float
    is_verified: bool
    hospital_name: str
    location: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    availability: List[DoctorAvailabilityResponse] = []

    class Config:
        from_attributes = True
