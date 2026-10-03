import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.appointment import Appointment
from app.models.patient import PatientProfile
from app.models.doctor import DoctorProfile
from app.models.notification import Notification
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.auth.dependencies import get_current_user, require_role
from app.utils.qr import generate_appointment_qr_base64
from app.utils.audit import record_audit
from app.dsa.sorting import mergesort

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("", response_model=AppointmentResponse)
def book_appointment(
    req: AppointmentCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    doctor = db.query(DoctorProfile).filter(DoctorProfile.id == req.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    # Check for Double Booking: is doctor already booked at this date and time?
    conflict = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == req.doctor_id,
            Appointment.appointment_date == req.appointment_date,
            Appointment.appointment_time == req.appointment_time,
            Appointment.status.in_(["pending", "confirmed"])
        )
        .first()
    )
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Dr. {doctor.name} is already booked at {req.appointment_time} on {req.appointment_date}. Please select another slot."
        )

    # Generate unique appointment code
    apt_code = f"APT-{uuid.uuid4().hex[:8].upper()}"

    # Generate QR Code Data
    qr_payload = {
        "code": apt_code,
        "patient": patient.name,
        "doctor": doctor.name,
        "specialty": doctor.specialization,
        "date": req.appointment_date,
        "time": req.appointment_time,
        "hospital": doctor.hospital_name
    }
    qr_data_url = generate_appointment_qr_base64(qr_payload)

    # Create Appointment
    new_apt = Appointment(
        appointment_code=apt_code,
        patient_id=patient.id,
        doctor_id=doctor.id,
        appointment_date=req.appointment_date,
        appointment_time=req.appointment_time,
        status="confirmed",
        reason=req.reason,
        consultation_type=req.consultation_type,
        patient_notes=req.patient_notes,
        qr_code_data=qr_data_url
    )
    db.add(new_apt)
    db.commit()
    db.refresh(new_apt)

    # Create Notifications for both patient and doctor
    notif_patient = Notification(
        user_id=current_user.id,
        title="Appointment Confirmed",
        message=f"Your appointment with Dr. {doctor.name} is confirmed for {req.appointment_date} at {req.appointment_time}.",
        notification_type="appointment",
        priority="high"
    )
    notif_doctor = Notification(
        user_id=doctor.user_id,
        title="New Patient Booking",
        message=f"{patient.name} has scheduled a {req.consultation_type} consultation on {req.appointment_date} at {req.appointment_time}.",
        notification_type="appointment",
        priority="high"
    )
    db.add(notif_patient)
    db.add(notif_doctor)
    db.commit()

    record_audit(db, action="BOOK_APPOINTMENT", resource="APPOINTMENTS", user_id=current_user.id, details=f"Booked {apt_code}")

    return {
        "id": new_apt.id,
        "appointment_code": new_apt.appointment_code,
        "patient_id": new_apt.patient_id,
        "doctor_id": new_apt.doctor_id,
        "doctor_name": doctor.name,
        "doctor_specialization": doctor.specialization,
        "patient_name": patient.name,
        "patient_age": patient.age,
        "patient_gender": patient.gender,
        "appointment_date": new_apt.appointment_date,
        "appointment_time": new_apt.appointment_time,
        "status": new_apt.status,
        "reason": new_apt.reason,
        "consultation_type": new_apt.consultation_type,
        "patient_notes": new_apt.patient_notes,
        "doctor_notes": new_apt.doctor_notes,
        "prescription_notes": new_apt.prescription_notes,
        "qr_code_data": new_apt.qr_code_data,
        "created_at": new_apt.created_at
    }

@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)

    if current_user.role == "patient":
        patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not patient:
            return []
        query = query.filter(Appointment.patient_id == patient.id)
    elif current_user.role == "doctor":
        doctor = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
        if not doctor:
            return []
        query = query.filter(Appointment.doctor_id == doctor.id)

    raw_list = query.all()

    # Convert to response dicts
    results = []
    for a in raw_list:
        results.append({
            "id": a.id,
            "appointment_code": a.appointment_code,
            "patient_id": a.patient_id,
            "doctor_id": a.doctor_id,
            "doctor_name": a.doctor.name if a.doctor else "Doctor",
            "doctor_specialization": a.doctor.specialization if a.doctor else "",
            "patient_name": a.patient.name if a.patient else "Patient",
            "patient_age": a.patient.age if a.patient else None,
            "patient_gender": a.patient.gender if a.patient else None,
            "appointment_date": a.appointment_date,
            "appointment_time": a.appointment_time,
            "status": a.status,
            "reason": a.reason,
            "consultation_type": a.consultation_type,
            "patient_notes": a.patient_notes,
            "doctor_notes": a.doctor_notes,
            "prescription_notes": a.prescription_notes,
            "qr_code_data": a.qr_code_data,
            "created_at": a.created_at
        })

    # Sort using custom DSA MergeSort: upcoming first
    sorted_res = mergesort(results, key=lambda x: (x["appointment_date"], x["appointment_time"]), reverse=True)
    return sorted_res

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment_details(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    return {
        "id": apt.id,
        "appointment_code": apt.appointment_code,
        "patient_id": apt.patient_id,
        "doctor_id": apt.doctor_id,
        "doctor_name": apt.doctor.name if apt.doctor else "",
        "doctor_specialization": apt.doctor.specialization if apt.doctor else "",
        "patient_name": apt.patient.name if apt.patient else "",
        "patient_age": apt.patient.age if apt.patient else None,
        "patient_gender": apt.patient.gender if apt.patient else None,
        "appointment_date": apt.appointment_date,
        "appointment_time": apt.appointment_time,
        "status": apt.status,
        "reason": apt.reason,
        "consultation_type": apt.consultation_type,
        "patient_notes": apt.patient_notes,
        "doctor_notes": apt.doctor_notes,
        "prescription_notes": apt.prescription_notes,
        "qr_code_data": apt.qr_code_data,
        "created_at": apt.created_at
    }

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    req: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    update_dict = req.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(apt, k, v)

    db.commit()
    db.refresh(apt)

    record_audit(db, action="UPDATE_APPOINTMENT", resource="APPOINTMENTS", user_id=current_user.id, details=f"Updated status={apt.status}")

    return {
        "id": apt.id,
        "appointment_code": apt.appointment_code,
        "patient_id": apt.patient_id,
        "doctor_id": apt.doctor_id,
        "doctor_name": apt.doctor.name if apt.doctor else "",
        "doctor_specialization": apt.doctor.specialization if apt.doctor else "",
        "patient_name": apt.patient.name if apt.patient else "",
        "patient_age": apt.patient.age if apt.patient else None,
        "patient_gender": apt.patient.gender if apt.patient else None,
        "appointment_date": apt.appointment_date,
        "appointment_time": apt.appointment_time,
        "status": apt.status,
        "reason": apt.reason,
        "consultation_type": apt.consultation_type,
        "patient_notes": apt.patient_notes,
        "doctor_notes": apt.doctor_notes,
        "prescription_notes": apt.prescription_notes,
        "qr_code_data": apt.qr_code_data,
        "created_at": apt.created_at
    }

@router.post("/verify-qr")
def verify_appointment_qr(
    code: str,
    current_user: User = Depends(require_role(["doctor", "admin"])),
    db: Session = Depends(get_db)
):
    """Clinic / Doctor scans the QR code to verify validity."""
    apt = db.query(Appointment).filter(Appointment.appointment_code == code.strip()).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Invalid appointment code or fake QR token.")

    return {
        "verified": True,
        "appointment_id": apt.id,
        "appointment_code": apt.appointment_code,
        "patient_name": apt.patient.name if apt.patient else "Patient",
        "doctor_name": apt.doctor.name if apt.doctor else "Doctor",
        "date": apt.appointment_date,
        "time": apt.appointment_time,
        "status": apt.status
    }
