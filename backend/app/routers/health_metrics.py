from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.health import HealthMetric
from app.models.gamification import Gamification
from app.schemas.health import HealthMetricCreate, HealthMetricResponse
from app.auth.dependencies import get_current_user, require_role
from app.dsa.sorting import quicksort

router = APIRouter(prefix="/health-metrics", tags=["Health Metrics"])

@router.get("", response_model=List[HealthMetricResponse])
def get_metrics(
    metric_type: Optional[str] = None,
    days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        return []

    cutoff = datetime.utcnow() - timedelta(days=days)
    query = db.query(HealthMetric).filter(
        HealthMetric.patient_id == patient.id,
        HealthMetric.recorded_at >= cutoff
    )

    if metric_type:
        query = query.filter(HealthMetric.metric_type == metric_type)

    metrics = query.all()
    # Sort chronologically ascending for charts using DSA QuickSort
    return quicksort(metrics, key=lambda m: m.recorded_at, reverse=False)

@router.post("", response_model=HealthMetricResponse)
def record_metric(
    req: HealthMetricCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    metric = HealthMetric(
        patient_id=patient.id,
        metric_type=req.metric_type,
        value=req.value,
        unit=req.unit,
        recorded_at=req.recorded_at or datetime.utcnow(),
        notes=req.notes
    )
    db.add(metric)

    # Award points for logging health metric
    game = db.query(Gamification).filter(Gamification.patient_id == patient.id).first()
    if game:
        game.points += 10
        db.add(game)

    db.commit()
    db.refresh(metric)
    return metric

@router.get("/summary")
def get_metrics_summary(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        return {}

    metric_types = ["heart_rate", "bp_systolic", "bp_diastolic", "blood_glucose", "weight", "temperature", "water_ml", "sleep_hours", "steps"]
    summary = {}

    for m_type in metric_types:
        latest = (
            db.query(HealthMetric)
            .filter(HealthMetric.patient_id == patient.id, HealthMetric.metric_type == m_type)
            .order_by(HealthMetric.recorded_at.desc())
            .first()
        )
        if latest:
            summary[m_type] = {
                "value": latest.value,
                "unit": latest.unit,
                "recorded_at": latest.recorded_at.isoformat()
            }

    return summary
