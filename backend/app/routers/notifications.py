from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationCreate
from app.auth.dependencies import get_current_user
from app.dsa import MaxPriorityQueue

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns user notifications ordered by Priority Queue Max-Heap
    (Urgent/High priority alerts appear before Medium/Low).
    """
    raw_notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )

    # Priority score mapping for DSA Priority Queue
    priority_weights = {
        "urgent": 100.0,
        "high": 75.0,
        "medium": 50.0,
        "low": 25.0
    }

    pq = MaxPriorityQueue()
    for n in raw_notifications:
        # Give unread items a priority boost (+10)
        base_p = priority_weights.get(n.priority.lower(), 50.0)
        final_p = base_p + (10.0 if not n.is_read else 0.0)
        pq.push(final_p, n)

    # Extract in priority order
    sorted_notifications = pq.to_sorted_list()
    return sorted_notifications

@router.put("/{notif_id}/read")
def mark_as_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = (
        db.query(Notification)
        .filter(Notification.id == notif_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.is_read = True
    db.commit()
    return {"message": "Notification marked as read."}

@router.put("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read."}

@router.delete("/{notif_id}")
def delete_notification(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = (
        db.query(Notification)
        .filter(Notification.id == notif_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted."}
