from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, PasswordResetRequest
from app.schemas.patient import PatientProfileUpdate, PatientProfileResponse
from app.schemas.doctor import DoctorProfileUpdate, DoctorProfileResponse, DoctorAvailabilityCreate, DoctorAvailabilityResponse
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse, AppointmentSlotResponse
from app.schemas.health import (
    HealthMetricCreate, HealthMetricResponse,
    HealthRecordResponse, MedicationCreate, MedicationUpdate,
    MedicationResponse, MedicationLogCreate, MedicationLogResponse
)
from app.schemas.symptom import SymptomAnalyzeRequest, SymptomAnalyzeResponse, SymptomSessionResponse, SymptomAutocompleteResponse
from app.schemas.ai_chat import ChatMessageRequest, AIMessageResponse, ConversationResponse, ChatStreamResponse
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.schemas.admin import AdminStatsResponse, DoctorVerifyRequest, AuditLogResponse, SystemBroadcastRequest
from app.schemas.gamification import GamificationResponse, AddPointsRequest

__all__ = [
    "UserRegister", "UserLogin", "Token", "UserResponse", "PasswordResetRequest",
    "PatientProfileUpdate", "PatientProfileResponse",
    "DoctorProfileUpdate", "DoctorProfileResponse", "DoctorAvailabilityCreate", "DoctorAvailabilityResponse",
    "AppointmentCreate", "AppointmentUpdate", "AppointmentResponse", "AppointmentSlotResponse",
    "HealthMetricCreate", "HealthMetricResponse", "HealthRecordResponse",
    "MedicationCreate", "MedicationUpdate", "MedicationResponse", "MedicationLogCreate", "MedicationLogResponse",
    "SymptomAnalyzeRequest", "SymptomAnalyzeResponse", "SymptomSessionResponse", "SymptomAutocompleteResponse",
    "ChatMessageRequest", "AIMessageResponse", "ConversationResponse", "ChatStreamResponse",
    "NotificationCreate", "NotificationResponse",
    "AdminStatsResponse", "DoctorVerifyRequest", "AuditLogResponse", "SystemBroadcastRequest",
    "GamificationResponse", "AddPointsRequest"
]
