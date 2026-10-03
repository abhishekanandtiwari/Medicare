from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Dict, Any, List

from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.health import HealthMetric, HealthRecord, Medication, MedicationLog
from app.models.appointment import Appointment
from app.models.symptom import SymptomSession
from app.models.gamification import Gamification
from app.schemas.patient import PatientProfileUpdate, PatientProfileResponse
from app.auth.dependencies import get_current_user, require_role
from app.ai.wellness_insights import wellness_insights_engine
from app.dsa.sorting import mergesort

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/profile", response_model=PatientProfileResponse)
def get_profile(
    current_user: User = Depends(require_role(["patient", "admin"])),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    return profile

@router.put("/profile", response_model=PatientProfileResponse)
def update_profile(
    req: PatientProfileUpdate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        profile = PatientProfile(user_id=current_user.id, name=req.name or "User")
        db.add(profile)

    update_dict = req.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        setattr(profile, key, val)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/dashboard")
def get_patient_dashboard(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    # 1. Determine Greeting based on hour
    hour = datetime.now().hour
    if hour < 12:
        greeting = f"Good Morning, {profile.name} 👋"
    elif hour < 17:
        greeting = f"Good Afternoon, {profile.name} 👋"
    else:
        greeting = f"Good Evening, {profile.name} 👋"

    # 2. Fetch Latest Health Metrics
    metrics_query = (
        db.query(HealthMetric)
        .filter(HealthMetric.patient_id == profile.id)
        .order_by(HealthMetric.recorded_at.desc())
        .limit(50)
        .all()
    )

    latest_metrics: Dict[str, Any] = {
        "heart_rate": {"value": 72, "unit": "bpm", "status": "Normal"},
        "temperature": {"value": 98.6, "unit": "°F", "status": "Normal"},
        "blood_pressure": {"systolic": 120, "diastolic": 80, "unit": "mmHg", "status": "Optimal"},
        "blood_glucose": {"value": 95, "unit": "mg/dL", "status": "Normal"},
        "weight": {"value": profile.weight_kg or 70.0, "unit": "kg", "status": "Stable"},
        "water_ml": {"value": 1800, "unit": "ml", "status": "Good"},
        "sleep_hours": {"value": 7.5, "unit": "hours", "status": "Restful"},
        "steps": {"value": 6420, "unit": "steps", "status": "Active"}
    }

    metrics_for_insights = []
    for m in metrics_query:
        metrics_for_insights.append({
            "metric_type": m.metric_type,
            "value": m.value,
            "unit": m.unit,
            "recorded_at": m.recorded_at.isoformat()
        })
        if m.metric_type in latest_metrics:
            latest_metrics[m.metric_type]["value"] = m.value
            latest_metrics[m.metric_type]["unit"] = m.unit
        elif m.metric_type == "bp_systolic":
            latest_metrics["blood_pressure"]["systolic"] = m.value
        elif m.metric_type == "bp_diastolic":
            latest_metrics["blood_pressure"]["diastolic"] = m.value

    # 3. Upcoming Appointment
    today_str = date.today().isoformat()
    upcoming_apt = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == profile.id,
            Appointment.appointment_date >= today_str,
            Appointment.status.in_(["pending", "confirmed"])
        )
        .order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc())
        .first()
    )
    
    upcoming_apt_data = None
    if upcoming_apt:
        doctor = upcoming_apt.doctor
        upcoming_apt_data = {
            "id": upcoming_apt.id,
            "code": upcoming_apt.appointment_code,
            "doctor_name": doctor.name if doctor else "Healthcare Specialist",
            "doctor_specialization": doctor.specialization if doctor else "General Medicine",
            "hospital_name": doctor.hospital_name if doctor else "Medicare Center",
            "date": upcoming_apt.appointment_date,
            "time": upcoming_apt.appointment_time,
            "status": upcoming_apt.status,
            "consultation_type": upcoming_apt.consultation_type,
            "qr_code_data": upcoming_apt.qr_code_data
        }

    # 4. Next Medication Reminder
    medications = (
        db.query(Medication)
        .filter(Medication.patient_id == profile.id, Medication.is_active == True)
        .all()
    )
    next_medication = None
    if medications:
        m = medications[0]
        # Check if already logged taken today
        today_log = (
            db.query(MedicationLog)
            .filter(
                MedicationLog.medication_id == m.id,
                MedicationLog.scheduled_time.contains(today_str)
            )
            .first()
        )
        next_medication = {
            "id": m.id,
            "name": m.medicine_name,
            "dosage": m.dosage,
            "frequency": m.frequency,
            "reminder_time": m.reminder_time,
            "refills_left": m.refills_left,
            "status": today_log.status if today_log else "scheduled"
        }

    # 5. Wellness Insights Engine
    insights = wellness_insights_engine.generate_insights(
        metrics=metrics_for_insights,
        medication_adherence_pct=92.0,
        patient_name=profile.name
    )

    # 6. Gamification Stats
    game = db.query(Gamification).filter(Gamification.patient_id == profile.id).first()
    if not game:
        game = Gamification(patient_id=profile.id, points=120, current_streak=4, highest_streak=7)
        db.add(game)
        db.commit()
        db.refresh(game)

    # 7. Recent Activity Timeline (Unified Events sorted via DSA MergeSort)
    raw_activities = []
    
    # Recent appointments
    for apt in db.query(Appointment).filter(Appointment.patient_id == profile.id).order_by(Appointment.created_at.desc()).limit(3).all():
        raw_activities.append({
            "type": "appointment",
            "title": f"Appointment with {apt.doctor.name if apt.doctor else 'Doctor'}",
            "subtitle": f"{apt.appointment_date} at {apt.appointment_time} ({apt.status.title()})",
            "timestamp": apt.created_at.isoformat(),
            "badge_color": "mediblue"
        })

    # Recent reports
    for rep in db.query(HealthRecord).filter(HealthRecord.patient_id == profile.id).order_by(HealthRecord.uploaded_at.desc()).limit(3).all():
        raw_activities.append({
            "type": "report",
            "title": f"Report Uploaded: {rep.title}",
            "subtitle": f"{rep.category.replace('_', ' ').title()} • AI Summary Generated",
            "timestamp": rep.uploaded_at.isoformat(),
            "badge_color": "emerald"
        })

    # Recent symptom sessions
    for sym in db.query(SymptomSession).filter(SymptomSession.patient_id == profile.id).order_by(SymptomSession.created_at.desc()).limit(3).all():
        raw_activities.append({
            "type": "symptom",
            "title": f"Symptom Assessment: {sym.risk_level}",
            "subtitle": f"Duration: {sym.duration} • Severity: {sym.severity}",
            "timestamp": sym.created_at.isoformat(),
            "badge_color": "amber"
        })

    # Sort recent activities chronologically using our custom DSA MergeSort
    sorted_activities = mergesort(raw_activities, key=lambda x: x["timestamp"], reverse=True)

    return {
        "greeting": greeting,
        "patient_name": profile.name,
        "age": profile.age,
        "blood_group": profile.blood_group,
        "accessibility_mode": profile.accessibility_mode,
        "health_cards": latest_metrics,
        "upcoming_appointment": upcoming_apt_data,
        "next_medication": next_medication,
        "ai_insights": insights[:3],
        "recent_activity": sorted_activities[:6],
        "gamification": {
            "points": game.points,
            "current_streak": game.current_streak,
            "highest_streak": game.highest_streak
        }
    }
