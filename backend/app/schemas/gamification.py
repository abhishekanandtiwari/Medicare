from pydantic import BaseModel
from typing import List, Optional

class GamificationResponse(BaseModel):
    points: int
    current_streak: int
    highest_streak: int
    last_activity_date: Optional[str]
    badges: List[str]

    class Config:
        from_attributes = True

class AddPointsRequest(BaseModel):
    activity_type: str # "vital_log", "medicine_taken", "report_upload", "consultation"
    points: int = 10
