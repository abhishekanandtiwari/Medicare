from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class DoctorProfile(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    specialization = Column(String(150), nullable=False, index=True)
    qualification = Column(String(255), nullable=False)
    experience_years = Column(Integer, default=0)
    bio = Column(Text, nullable=True)
    consultation_fee = Column(Float, default=50.0)
    rating = Column(Float, default=4.8)
    is_verified = Column(Boolean, default=False)
    hospital_name = Column(String(255), default="Medicare General Hospital")
    location = Column(String(255), default="Central Health Hub")
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    availability = relationship("DoctorAvailability", back_populates="doctor", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="doctor")

class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String(20), nullable=False)  # "Monday", "Tuesday", etc.
    start_time = Column(String(10), nullable=False)   # "09:00"
    end_time = Column(String(10), nullable=False)     # "17:00"
    slot_duration_minutes = Column(Integer, default=30)
    is_available = Column(Boolean, default=True)

    doctor = relationship("DoctorProfile", back_populates="availability")
