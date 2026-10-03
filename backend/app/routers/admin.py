from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.doctor import DoctorProfile
from app.models.appointment import Appointment
from app.models.health import HealthRecord
from app.models.ai import AIConversation
from app.models.audit import AuditLog
from app.models.notification import Notification
from app.schemas.admin import AdminStatsResponse, DoctorVerifyRequest, AuditLogResponse, SystemBroadcastRequest
from app.auth.dependencies import require_role
from app.dsa import app_cache, symptom_trie, emergency_triage_queue, appointment_waitlist
from app.utils.audit import record_audit

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_patients = db.query(PatientProfile).count()
    total_doctors = db.query(DoctorProfile).count()
    verified_doctors = db.query(DoctorProfile).filter(DoctorProfile.is_verified == True).count()
    total_appointments = db.query(Appointment).count()
    total_records = db.query(HealthRecord).count()
    total_ai_convs = db.query(AIConversation).count()

    dsa_metrics = {
        "symptom_trie_nodes": symptom_trie.size(),
        "hashmap_cache_stats": app_cache.get_stats(),
        "emergency_triage_queue_size": emergency_triage_queue.size(),
        "appointment_waitlist_size": appointment_waitlist.size()
    }

    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "verified_doctors": verified_doctors,
        "total_appointments": total_appointments,
        "total_health_records": total_records,
        "total_ai_interactions": total_ai_convs,
        "system_health": "Healthy (All microservices operational)",
        "dsa_metrics": dsa_metrics
    }

@router.get("/users")
def get_all_users(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    result = []
    for u in users:
        name = u.email.split("@")[0].title()
        if u.role == "patient" and u.patient_profile:
            name = u.patient_profile.name
        elif u.role == "doctor" and u.doctor_profile:
            name = u.doctor_profile.name

        result.append({
            "id": u.id,
            "email": u.email,
            "name": name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return result

@router.post("/doctors/verify")
def verify_doctor(
    req: DoctorVerifyRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    doc = db.query(DoctorProfile).filter(DoctorProfile.id == req.doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor profile not found.")
    
    doc.is_verified = req.is_verified
    db.commit()

    record_audit(db, action="VERIFY_DOCTOR", resource="DOCTORS", user_id=current_user.id, details=f"Doctor {doc.id} verification set to {req.is_verified}")

    # Notify doctor
    notif = Notification(
        user_id=doc.user_id,
        title="Doctor Verification Status Updated",
        message=f"Your professional medical profile has been {'verified and approved' if req.is_verified else 'unverified'}.",
        notification_type="system",
        priority="high"
    )
    db.add(notif)
    db.commit()

    return {"message": f"Doctor {doc.name} verification status updated to {req.is_verified}."}

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "user_id": l.user_id,
            "user_email": l.user.email if l.user else "System",
            "action": l.action,
            "resource": l.resource,
            "details": l.details,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp
        })
    return results

@router.post("/broadcast")
def broadcast_notification(
    req: SystemBroadcastRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Admin broadcasts a notification to all users or filtered by role."""
    query = db.query(User).filter(User.is_active == True)
    if req.target_role and req.target_role != "all":
        query = query.filter(User.role == req.target_role)

    target_users = query.all()
    for u in target_users:
        notif = Notification(
            user_id=u.id,
            title=req.title,
            message=req.message,
            notification_type="system",
            priority=req.priority
        )
        db.add(notif)

    db.commit()
    record_audit(db, action="SYSTEM_BROADCAST", resource="NOTIFICATIONS", user_id=current_user.id, details=f"Dispatched to {len(target_users)} users")

    return {"message": f"Broadcast successfully dispatched to {len(target_users)} users."}
