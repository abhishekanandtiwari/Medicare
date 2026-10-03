from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.ai import AIConversation, AIMessage
from app.models.health import HealthMetric, Medication, MedicationLog
from app.schemas.ai_chat import ChatMessageRequest, ConversationResponse, ChatStreamResponse
from app.auth.dependencies import get_current_user
from app.ai.assistant import health_assistant_service
from app.ai.wellness_insights import wellness_insights_engine
from app.utils.audit import record_audit

router = APIRouter(prefix="/ai", tags=["AI Health Assistant"])

@router.post("/chat", response_model=ChatStreamResponse)
async def chat_with_assistant(
    req: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient_context = {}
    if current_user.role == "patient" and current_user.patient_profile:
        p = current_user.patient_profile
        patient_context = {
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "allergies": p.allergies,
            "existing_conditions": p.existing_conditions,
            "current_medications": p.current_medications
        }

    # Find or create Conversation thread
    conversation = None
    if req.conversation_id:
        conversation = (
            db.query(AIConversation)
            .filter(AIConversation.id == req.conversation_id, AIConversation.user_id == current_user.id)
            .first()
        )

    if not conversation:
        title = req.message[:40] + ("..." if len(req.message) > 40 else "")
        conversation = AIConversation(user_id=current_user.id, title=title)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Save User message
    user_msg = AIMessage(
        conversation_id=conversation.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)
    db.commit()

    # Load conversation history for context
    history_records = (
        db.query(AIMessage)
        .filter(AIMessage.conversation_id == conversation.id)
        .order_by(AIMessage.timestamp.asc())
        .limit(10)
        .all()
    )
    messages_payload = [{"role": m.role, "content": m.content} for m in history_records]

    # Generate AI response
    ai_result = await health_assistant_service.get_response(
        messages=messages_payload,
        patient_context=patient_context
    )

    # Save Assistant message
    assistant_msg = AIMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_result["reply"]
    )
    db.add(assistant_msg)
    conversation.updated_at = datetime.utcnow()
    db.commit()

    record_audit(db, action="AI_CHAT", resource="AI_ASSISTANT", user_id=current_user.id, details="Exchanged query with health assistant")

    return {
        "conversation_id": conversation.id,
        "reply": ai_result["reply"],
        "is_emergency": ai_result.get("is_emergency", False),
        "follow_up_questions": ai_result.get("follow_up_questions", []),
        "suggested_actions": ai_result.get("suggested_actions")
    }

@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(AIConversation)
        .filter(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.updated_at.desc())
        .all()
    )

@router.get("/conversations/{conv_id}", response_model=ConversationResponse)
def get_conversation_by_id(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = (
        db.query(AIConversation)
        .filter(AIConversation.id == conv_id, AIConversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv

@router.delete("/conversations/{conv_id}")
def delete_conversation(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = (
        db.query(AIConversation)
        .filter(AIConversation.id == conv_id, AIConversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted."}

@router.get("/wellness-insights")
def get_wellness_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        return []

    # Query recent metrics
    metrics = (
        db.query(HealthMetric)
        .filter(HealthMetric.patient_id == patient.id)
        .order_by(HealthMetric.recorded_at.desc())
        .limit(30)
        .all()
    )
    metrics_list = [{"metric_type": m.metric_type, "value": m.value, "unit": m.unit} for m in metrics]

    return wellness_insights_engine.generate_insights(
        metrics=metrics_list,
        medication_adherence_pct=90.0,
        patient_name=patient.name
    )
