from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.doctor import DoctorProfile, DoctorAvailability
from app.models.appointment import Appointment
from app.models.patient import PatientProfile
from app.models.health import HealthRecord
from app.schemas.doctor import DoctorProfileResponse, DoctorProfileUpdate, DoctorAvailabilityCreate, DoctorAvailabilityResponse
from app.auth.dependencies import get_current_user, require_role
from app.dsa.sorting import quicksort

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("", response_model=List[DoctorProfileResponse])
def get_doctors(
    search: Optional[str] = None,
    specialization: Optional[str] = None,
    sort_by: Optional[str] = "rating", # "rating", "experience", "fee"
    db: Session = Depends(get_db)
):
    query = db.query(DoctorProfile)

    if specialization and specialization != "All":
        query = query.filter(DoctorProfile.specialization.ilike(f"%{specialization}%"))

    if search:
        query = query.filter(
            (DoctorProfile.name.ilike(f"%{search}%")) |
            (DoctorProfile.specialization.ilike(f"%{search}%")) |
            (DoctorProfile.hospital_name.ilike(f"%{search}%"))
        )

    doctors = query.all()

    # Sort using custom DSA QuickSort
    if sort_by == "experience":
        doctors = quicksort(doctors, key=lambda d: d.experience_years, reverse=True)
    elif sort_by == "fee":
        doctors = quicksort(doctors, key=lambda d: d.consultation_fee, reverse=False)
    else: # rating
        doctors = quicksort(doctors, key=lambda d: d.rating, reverse=True)

    return doctors

@router.get("/dashboard/summary")
def get_doctor_dashboard_summary(
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doc = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor profile not found.")

    today_str = date.today().isoformat()

    # Appointments for today
    today_appointments = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == doc.id, Appointment.appointment_date == today_str)
        .order_by(Appointment.appointment_time.asc())
        .all()
    )

    # All upcoming appointments
    upcoming = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doc.id,
            Appointment.appointment_date >= today_str,
            Appointment.status.in_(["pending", "confirmed"])
        )
        .order_by(Appointment.appointment_date.asc(), Appointment.appointment_time.asc())
        .limit(10)
        .all()
    )

    # Pending requests count
    pending_count = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == doc.id, Appointment.status == "pending")
        .count()
    )

    # Total distinct patients
    total_patients_count = (
        db.query(Appointment.patient_id)
        .filter(Appointment.doctor_id == doc.id)
        .distinct()
        .count()
    )

    # Format upcoming list
    formatted_upcoming = []
    for a in upcoming:
        patient = a.patient
        formatted_upcoming.append({
            "id": a.id,
            "appointment_code": a.appointment_code,
            "patient_name": patient.name if patient else "Patient",
            "patient_age": patient.age if patient else None,
            "patient_gender": patient.gender if patient else None,
            "appointment_date": a.appointment_date,
            "appointment_time": a.appointment_time,
            "status": a.status,
            "reason": a.reason,
            "consultation_type": a.consultation_type,
            "doctor_notes": a.doctor_notes,
            "qr_code_data": a.qr_code_data
        })

    return {
        "doctor_name": doc.name,
        "specialization": doc.specialization,
        "is_verified": doc.is_verified,
        "rating": doc.rating,
        "today_appointments_count": len(today_appointments),
        "upcoming_appointments": formatted_upcoming,
        "pending_requests_count": pending_count,
        "total_patients_treated": total_patients_count,
        "availability": doc.availability
    }

@router.get("/{doctor_id}", response_model=DoctorProfileResponse)
def get_doctor_by_id(doctor_id: int, db: Session = Depends(get_db)):
    doc = db.query(DoctorProfile).filter(DoctorProfile.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found.")
    return doc

@router.get("/{doctor_id}/slots")
def get_available_slots(
    doctor_id: int,
    date_str: str = Query(..., alias="date", description="Format: YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """
    Computes 30-minute consultation slots based on doctor availability,
    and marks already booked slots to prevent double-booking.
    """
    doc = db.query(DoctorProfile).filter(DoctorProfile.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    try:
        req_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")

    # Determine day of week name (e.g. "Monday")
    day_name = req_date.strftime("%A")

    # Find schedule for this day
    sched = (
        db.query(DoctorAvailability)
        .filter(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.day_of_week.ilike(day_name),
            DoctorAvailability.is_available == True
        )
        .first()
    )

    # Standard fallback hours if not explicitly customized: 09:00 to 17:00
    start_hour = 9
    end_hour = 17
    if sched:
        try:
            start_hour = int(sched.start_time.split(":")[0])
            end_hour = int(sched.end_time.split(":")[0])
        except Exception:
            pass

    # Generate slots
    generated_slots = []
    for h in range(start_hour, end_hour):
        for m in [0, 30]:
            time_str = f"{h:02d}:{m:02d}"
            generated_slots.append(time_str)

    # Query already booked active appointments on that date
    booked_appointments = (
        db.query(Appointment.appointment_time)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date == date_str,
            Appointment.status.in_(["pending", "confirmed"])
        )
        .all()
    )
    booked_times = {b[0] for b in booked_appointments}

    return [
        {"time": slot, "is_booked": (slot in booked_times)}
        for slot in generated_slots
    ]

@router.put("/profile", response_model=DoctorProfileResponse)
def update_doctor_profile(
    req: DoctorProfileUpdate,
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doc = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor profile not found.")

    update_dict = req.model_dump(exclude_unset=True)
    for key, val in update_dict.items():
        setattr(doc, key, val)

    db.commit()
    db.refresh(doc)
    return doc

@router.post("/availability")
def set_doctor_availability(
    availabilities: List[DoctorAvailabilityCreate],
    current_user: User = Depends(require_role(["doctor"])),
    db: Session = Depends(get_db)
):
    doc = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor profile not found.")

    # Clear existing and update
    db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doc.id).delete()
    for item in availabilities:
        new_avail = DoctorAvailability(
            doctor_id=doc.id,
            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
            slot_duration_minutes=item.slot_duration_minutes,
            is_available=item.is_available
        )
        db.add(new_avail)

    db.commit()
    return {"message": "Availability schedule updated successfully."}
