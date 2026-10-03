from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.notification import Notification
from app.auth.dependencies import get_current_user
from app.dsa import emergency_triage_queue
from app.utils.audit import record_audit

router = APIRouter(prefix="/emergency", tags=["Emergency Mode"])

@router.get("/profile")
def get_emergency_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    
    # Safe defaults if profile not yet populated
    name = patient.name if patient else "User"
    blood_group = patient.blood_group if patient and patient.blood_group else "Not Specified"
    allergies = patient.allergies if patient and patient.allergies else "None reported"
    conditions = patient.existing_conditions if patient and patient.existing_conditions else "None reported"
    medications = patient.current_medications if patient and patient.current_medications else "None reported"
    contact_name = patient.emergency_contact_name if patient and patient.emergency_contact_name else "Configured Family Contact"
    contact_phone = patient.emergency_contact_phone if patient and patient.emergency_contact_phone else "+1-800-555-0199"
    contact_relation = patient.emergency_contact_relation if patient and patient.emergency_contact_relation else "Guardian / Relative"

    return {
        "patient_name": name,
        "blood_group": blood_group,
        "allergies": allergies,
        "existing_conditions": conditions,
        "current_medications": medications,
        "emergency_contact": {
            "name": contact_name,
            "phone": contact_phone,
            "relation": contact_relation
        },
        "emergency_services": [
            {"service": "National Emergency Number", "number": "112 / 911"},
            {"service": "Ambulance / Medical Emergency", "number": "102 / 108"},
            {"service": "Poison Control Helpline", "number": "1-800-222-1222"},
            {"service": "Mental Health & Crisis Hotline", "number": "988"}
        ],
        "instructions": (
            "If you or someone nearby is experiencing acute chest pain, severe breathlessness, "
            "profuse bleeding, loss of consciousness, or symptoms of stroke, dial emergency services immediately."
        )
    }

@router.post("/trigger")
def trigger_emergency_alert(
    notes: str = "Patient initiated Emergency SOS button",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    patient_name = patient.name if patient else "Patient"

    # Push to Priority Queue DSA with max priority (100.0)
    alert_payload = {
        "user_id": current_user.id,
        "patient_name": patient_name,
        "timestamp": datetime.utcnow().isoformat(),
        "notes": notes
    }
    emergency_triage_queue.push(priority=100.0, data=alert_payload)

    # Create Urgent Notification
    notif = Notification(
        user_id=current_user.id,
        title="EMERGENCY ALERT TRIGGERED",
        message=f"Emergency mode activated. Emergency contact {patient.emergency_contact_phone if patient else ''} flagged.",
        notification_type="emergency",
        priority="urgent"
    )
    db.add(notif)
    db.commit()

    record_audit(db, action="EMERGENCY_TRIGGER", resource="EMERGENCY", user_id=current_user.id, details="SOS button pressed")

    return {
        "status": "active",
        "alert_enqueued": True,
        "triage_queue_size": emergency_triage_queue.size(),
        "action_required": "Please call 112 / 911 or reach your emergency contact immediately."
    }
