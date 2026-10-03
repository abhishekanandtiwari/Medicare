from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Gamification(Base):
    __tablename__ = "gamification"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False)
    points = Column(Integer, default=50)
    current_streak = Column(Integer, default=1)
    highest_streak = Column(Integer, default=1)
    last_activity_date = Column(String(20), nullable=True) # "YYYY-MM-DD"
    badges = Column(Text, default='["Health Pioneer", "Profile Complete"]') # JSON list

    patient = relationship("PatientProfile", back_populates="gamification")
