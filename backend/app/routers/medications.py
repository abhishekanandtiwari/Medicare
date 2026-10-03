from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.health import Medication, MedicationLog
from app.models.gamification import Gamification
from app.schemas.health import (
    MedicationCreate, MedicationUpdate, MedicationResponse,
    MedicationLogCreate, MedicationLogResponse
)
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/medications", tags=["Medications"])

@router.get("", response_model=List[MedicationResponse])
def get_medications(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        return []
    return db.query(Medication).filter(Medication.patient_id == patient.id).all()

@router.post("", response_model=MedicationResponse)
def add_medication(
    req: MedicationCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    new_med = Medication(
        patient_id=patient.id,
        medicine_name=req.medicine_name,
        dosage=req.dosage,
        frequency=req.frequency,
        reminder_time=req.reminder_time,
        start_date=req.start_date or date.today().isoformat(),
        end_date=req.end_date,
        refills_left=req.refills_left,
        notes=req.notes,
        is_active=True
    )
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    return new_med

@router.put("/{med_id}", response_model=MedicationResponse)
def update_medication(
    med_id: int,
    req: MedicationUpdate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    med = db.query(Medication).filter(Medication.id == med_id, Medication.patient_id == patient.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found.")

    update_dict = req.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(med, k, v)

    db.commit()
    db.refresh(med)
    return med

@router.delete("/{med_id}")
def delete_medication(
    med_id: int,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    med = db.query(Medication).filter(Medication.id == med_id, Medication.patient_id == patient.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found.")
    db.delete(med)
    db.commit()
    return {"message": "Medication removed successfully."}

@router.post("/{med_id}/log", response_model=MedicationLogResponse)
def log_medication_intake(
    med_id: int,
    req: MedicationLogCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    med = db.query(Medication).filter(Medication.id == med_id, Medication.patient_id == patient.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found.")

    today_str = date.today().isoformat()
    log_entry = MedicationLog(
        medication_id=med.id,
        patient_id=patient.id,
        scheduled_time=f"{today_str} {med.reminder_time}",
        status=req.status
    )
    db.add(log_entry)

    # Award gamification points for taking scheduled meds
    if req.status == "taken":
        game = db.query(Gamification).filter(Gamification.patient_id == patient.id).first()
        if game:
            game.points += 15
            db.add(game)

    db.commit()
    db.refresh(log_entry)
    return log_entry
