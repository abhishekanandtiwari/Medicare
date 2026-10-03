import os
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.health import HealthRecord
from app.models.notification import Notification
from app.models.gamification import Gamification
from app.schemas.health import HealthRecordResponse
from app.auth.dependencies import get_current_user, require_role
from app.ai.report_summarizer import report_summarizer_service
from app.utils.audit import record_audit

router = APIRouter(prefix="/health-records", tags=["Health Records"])

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "txt"}

@router.get("", response_model=List[HealthRecordResponse])
def get_records(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(HealthRecord)

    if current_user.role == "patient":
        patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not patient:
            return []
        query = query.filter(HealthRecord.patient_id == patient.id)
    # Doctors can view records if provided, or patient records

    if category and category != "all":
        query = query.filter(HealthRecord.category == category)

    return query.order_by(HealthRecord.uploaded_at.desc()).all()

@router.post("/upload", response_model=HealthRecordResponse)
async def upload_health_record(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(default="lab_report"),
    doctor_notes: Optional[str] = Form(None),
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    # Validate file extension
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read content & check size limit (15MB)
    contents = await file.read()
    size_kb = round(len(contents) / 1024, 2)
    if size_kb > (settings.MAX_UPLOAD_SIZE_MB * 1024):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Save file to disk
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Extract text from file
    extracted_text = report_summarizer_service.extract_text_from_file(file_path, ext)
    
    # Run AI Report Summarizer
    ai_analysis = report_summarizer_service.summarize(
        document_text=extracted_text,
        document_title=title
    )
    ai_summary_str = json.dumps(ai_analysis)
    ai_questions_str = json.dumps(ai_analysis.get("questions_to_ask_doctor", []))

    # Save to Database
    record = HealthRecord(
        patient_id=patient.id,
        category=category,
        title=title,
        file_url=f"/uploads/{unique_filename}",
        file_type=ext,
        file_size_kb=size_kb,
        ai_summary=ai_summary_str,
        ai_questions=ai_questions_str,
        doctor_notes=doctor_notes
    )
    db.add(record)

    # Create notification for patient
    notif = Notification(
        user_id=current_user.id,
        title="Medical Report Analyzed",
        message=f"AI summary is ready for your uploaded report: '{title}'.",
        notification_type="report",
        priority="medium"
    )
    db.add(notif)

    # Award Gamification points
    game = db.query(Gamification).filter(Gamification.patient_id == patient.id).first()
    if game:
        game.points += 25
        db.add(game)

    db.commit()
    db.refresh(record)

    record_audit(db, action="UPLOAD_REPORT", resource="HEALTH_RECORDS", user_id=current_user.id, details=f"Uploaded {title}")

    return record

@router.get("/{record_id}", response_model=HealthRecordResponse)
def get_record_by_id(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Health record not found.")
    return record

@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    current_user: User = Depends(require_role(["patient", "admin"])),
    db: Session = Depends(get_db)
):
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")

    # Remove physical file if present
    filename = os.path.basename(record.file_url)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except OSError:
            pass

    db.delete(record)
    db.commit()

    record_audit(db, action="DELETE_REPORT", resource="HEALTH_RECORDS", user_id=current_user.id, details=f"Deleted record {record_id}")
    return {"message": "Health record deleted successfully."}
