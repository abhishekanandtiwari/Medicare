from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class SymptomSession(Base):
    __tablename__ = "symptom_sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    symptoms_json = Column(Text, nullable=False)  # JSON array of selected symptoms
    duration = Column(String(50), nullable=False)   # e.g., "1-2 days", "Over a week"
    severity = Column(String(30), nullable=False)   # "Mild", "Moderate", "Severe"
    risk_level = Column(String(50), nullable=False) # "Low (Self Care)", "Moderate (Consult Doctor)", "High (Urgent Care)"
    assessment_result = Column(Text, nullable=False) # JSON assessment details
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("PatientProfile", back_populates="symptom_sessions")
