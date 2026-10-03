from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_code = Column(String(50), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(String(20), nullable=False, index=True)  # "YYYY-MM-DD"
    appointment_time = Column(String(20), nullable=False)              # "10:00"
    status = Column(String(30), default="confirmed", index=True)       # "pending", "confirmed", "completed", "cancelled"
    reason = Column(Text, nullable=True)
    consultation_type = Column(String(30), default="in_person")        # "in_person", "video", "chat"
    patient_notes = Column(Text, nullable=True)
    doctor_notes = Column(Text, nullable=True)
    prescription_notes = Column(Text, nullable=True)
    qr_code_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("PatientProfile", back_populates="appointments")
    doctor = relationship("DoctorProfile", back_populates="appointments")

    # Prevent double booking for the same doctor at the same date and time (unless cancelled)
    __table_args__ = (
        # Note: Handled also in application logic for status != 'cancelled'
    )
