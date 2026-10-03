from app.routers.auth import router as auth_router
from app.routers.patients import router as patients_router
from app.routers.doctors import router as doctors_router
from app.routers.appointments import router as appointments_router
from app.routers.medications import router as medications_router
from app.routers.health_metrics import router as health_metrics_router
from app.routers.health_records import router as health_records_router
from app.routers.symptoms import router as symptoms_router
from app.routers.ai import router as ai_router
from app.routers.notifications import router as notifications_router
from app.routers.emergency import router as emergency_router
from app.routers.admin import router as admin_router
from app.routers.gamification import router as gamification_router
from app.routers.dsa import router as dsa_router

__all__ = [
    "auth_router",
    "patients_router",
    "doctors_router",
    "appointments_router",
    "medications_router",
    "health_metrics_router",
    "health_records_router",
    "symptoms_router",
    "ai_router",
    "notifications_router",
    "emergency_router",
    "admin_router",
    "gamification_router",
    "dsa_router"
]
