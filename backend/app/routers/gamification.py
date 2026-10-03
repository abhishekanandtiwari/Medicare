import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.gamification import Gamification
from app.schemas.gamification import GamificationResponse, AddPointsRequest
from app.auth.dependencies import require_role

router = APIRouter(prefix="/gamification", tags=["Gamification"])

@router.get("", response_model=GamificationResponse)
def get_gamification_stats(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    game = db.query(Gamification).filter(Gamification.patient_id == patient.id).first()
    if not game:
        game = Gamification(
            patient_id=patient.id,
            points=120,
            current_streak=3,
            highest_streak=5,
            last_activity_date=date.today().isoformat(),
            badges='["Health Pioneer", "Profile Complete", "7-Day Vitals Streak"]'
        )
        db.add(game)
        db.commit()
        db.refresh(game)

    try:
        badges_list = json.loads(game.badges)
    except Exception:
        badges_list = ["Health Pioneer"]

    return {
        "points": game.points,
        "current_streak": game.current_streak,
        "highest_streak": game.highest_streak,
        "last_activity_date": game.last_activity_date,
        "badges": badges_list
    }

@router.post("/action")
def log_health_action(
    req: AddPointsRequest,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    game = db.query(Gamification).filter(Gamification.patient_id == patient.id).first()
    if not game:
        game = Gamification(patient_id=patient.id, points=50, current_streak=1, highest_streak=1)
        db.add(game)

    today_str = date.today().isoformat()
    if game.last_activity_date != today_str:
        game.current_streak += 1
        if game.current_streak > game.highest_streak:
            game.highest_streak = game.current_streak
        game.last_activity_date = today_str

    game.points += req.points
    db.commit()
    db.refresh(game)

    return {
        "message": f"Earned {req.points} points for {req.activity_type}!",
        "new_total_points": game.points,
        "streak": game.current_streak
    }
