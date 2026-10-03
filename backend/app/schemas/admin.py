from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AdminStatsResponse(BaseModel):
    total_users: int
    total_patients: int
    total_doctors: int
    verified_doctors: int
    total_appointments: int
    total_health_records: int
    total_ai_interactions: int
    system_health: str
    dsa_metrics: Dict[str, Any]

class DoctorVerifyRequest(BaseModel):
    doctor_id: int
    is_verified: bool

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user_email: Optional[str] = None
    action: str
    resource: str
    details: Optional[str]
    ip_address: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class SystemBroadcastRequest(BaseModel):
    title: str
    message: str
    target_role: Optional[str] = None # None means all, or "patient", "doctor"
    priority: str = "medium"
