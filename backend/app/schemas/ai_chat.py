from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessageRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str
    voice_input: bool = False

class AIMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[AIMessageResponse] = []

    class Config:
        from_attributes = True

class ChatStreamResponse(BaseModel):
    conversation_id: int
    reply: str
    is_emergency: bool
    follow_up_questions: List[str]
    suggested_actions: Optional[List[str]] = None
