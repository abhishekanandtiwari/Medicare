"""
Database Seeder for Medicare-AI
Creates demo users (Patient, Doctor, Admin), clinical profiles, schedules,
vitals, prescriptions, appointments with QR codes, and sample AI summaries.
"""
from datetime import datetime, date, timedelta
import json
import uuid

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.patient import PatientProfile
from app.models.doctor import DoctorProfile, DoctorAvailability
from app.models.appointment import Appointment
from app.models.health import HealthMetric, HealthRecord, Medication, MedicationLog
from app.models.symptom import SymptomSession
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.models.gamification import Gamification
from app.auth.security import hash_password
from app.utils.qr import generate_appointment_qr_base64

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).filter(User.email == "patient@medicare.ai").first():
        print("Database already seeded with demo accounts.")
        db.close()
        return

    print("Seeding database with demo data...")

    # 1. Admin User
    admin = User(
        email="admin@medicare.ai",
        password_hash=hash_password("Admin@123"),
        role="admin",
        is_active=True
    )
    db.add(admin)

    # 2. Doctors
    doctors_data = [
        {
            "email": "doctor@medicare.ai",
            "password": "Doctor@123",
            "name": "Dr. Sarah Sharma",
            "specialization": "Cardiology",
            "qualification": "MBBS, MD (Medicine), DM (Cardiology), FACC",
            "experience_years": 12,
            "bio": "Senior Consultant Cardiologist specializing in preventive cardiology, echocardiography, and hypertension management.",
            "consultation_fee": 75.0,
            "rating": 4.9,
            "hospital_name": "Apex Heart & Vascular Institute",
            "location": "North Wing, MediPark",
            "phone": "+1-800-555-0101",
            "is_verified": True
        },
        {
            "email": "dr.rajesh@medicare.ai",
            "password": "Doctor@123",
            "name": "Dr. Rajesh Patel",
            "specialization": "Neurology",
            "qualification": "MBBS, MD, DM (Neurology)",
            "experience_years": 15,
            "bio": "Expert in headache syndromes, stroke prevention, peripheral neuropathies, and sleep disorders.",
            "consultation_fee": 85.0,
            "rating": 4.8,
            "hospital_name": "Metro Neurosciences Center",
            "location": "Central Medical Tower",
            "phone": "+1-800-555-0102",
            "is_verified": True
        },
        {
            "email": "dr.ananya@medicare.ai",
            "password": "Doctor@123",
            "name": "Dr. Ananya Iyer",
            "specialization": "Pediatrics",
            "qualification": "MBBS, MD (Pediatrics), DCH",
            "experience_years": 9,
            "bio": "Compassionate pediatric specialist caring for child development, immunizations, and pediatric respiratory conditions.",
            "consultation_fee": 60.0,
            "rating": 4.9,
            "hospital_name": "Sunrise Children's Hospital",
            "location": "East Wing, Health City",
            "phone": "+1-800-555-0103",
            "is_verified": True
        },
        {
            "email": "dr.vikram@medicare.ai",
            "password": "Doctor@123",
            "name": "Dr. Vikram Mehta",
            "specialization": "Orthopedics",
            "qualification": "MBBS, MS (Orthopedics), M.Ch",
            "experience_years": 14,
            "bio": "Joint replacement and sports injury specialist focusing on knee, hip, and spine care.",
            "consultation_fee": 80.0,
            "rating": 4.7,
            "hospital_name": "Orthocare Surgical Center",
            "location": "Suite 402, MediCenter",
            "phone": "+1-800-555-0104",
            "is_verified": True
        },
        {
            "email": "dr.priya@medicare.ai",
            "password": "Doctor@123",
            "name": "Dr. Priya Nair",
            "specialization": "Dermatology",
            "qualification": "MBBS, MD (Dermatology)",
            "experience_years": 7,
            "bio": "Clinical and aesthetic dermatologist treating acute allergies, eczema, acne, and skin barrier health.",
            "consultation_fee": 65.0,
            "rating": 4.8,
            "hospital_name": "DermaGlow Clinical Care",
            "location": "Boulevard Plaza",
            "phone": "+1-800-555-0105",
            "is_verified": True
        },
        {
            "email": "dr.amit@medicare.ai",
            "password": "Doctor@123",
            "name": "Dr. Amit Roy",
            "specialization": "General Medicine",
            "qualification": "MBBS, MD (Internal Medicine)",
            "experience_years": 11,
            "bio": "Comprehensive adult primary care, diabetes control, infectious disease, and holistic wellness.",
            "consultation_fee": 50.0,
            "rating": 4.9,
            "hospital_name": "Medicare Central Clinic",
            "location": "Ground Floor, Health Block",
            "phone": "+1-800-555-0106",
            "is_verified": True
        }
    ]

    created_doctors = []
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    for doc_info in doctors_data:
        doc_user = User(
            email=doc_info["email"],
            password_hash=hash_password(doc_info["password"]),
            role="doctor",
            is_active=True
        )
        db.add(doc_user)
        db.commit()
        db.refresh(doc_user)

        doc_profile = DoctorProfile(
            user_id=doc_user.id,
            name=doc_info["name"],
            specialization=doc_info["specialization"],
            qualification=doc_info["qualification"],
            experience_years=doc_info["experience_years"],
            bio=doc_info["bio"],
            consultation_fee=doc_info["consultation_fee"],
            rating=doc_info["rating"],
            is_verified=doc_info["is_verified"],
            hospital_name=doc_info["hospital_name"],
            location=doc_info["location"],
            phone=doc_info["phone"]
        )
        db.add(doc_profile)
        db.commit()
        db.refresh(doc_profile)
        created_doctors.append(doc_profile)

        # Seed Availability
        for day in days_of_week:
            avail = DoctorAvailability(
                doctor_id=doc_profile.id,
                day_of_week=day,
                start_time="09:00",
                end_time="17:00",
                slot_duration_minutes=30,
                is_available=True
            )
            db.add(avail)
        db.commit()

    # 3. Patient User
    patient_user = User(
        email="patient@medicare.ai",
        password_hash=hash_password("Patient@123"),
        role="patient",
        is_active=True
    )
    db.add(patient_user)
    db.commit()
    db.refresh(patient_user)

    patient_profile = PatientProfile(
        user_id=patient_user.id,
        name="Abhishek Verma",
        dob="1994-05-18",
        age=32,
        gender="Male",
        height_cm=176.0,
        weight_kg=72.5,
        blood_group="O+",
        allergies="Penicillin, Dust mites",
        existing_conditions="Mild Seasonal Allergic Rhinitis",
        current_medications="Vitamin D3 2000 IU, Cetirizine 10mg (PRN)",
        emergency_contact_name="Sunita Verma",
        emergency_contact_phone="+1-800-555-0999",
        emergency_contact_relation="Spouse",
        preferred_language="en",
        accessibility_mode="standard"
    )
    db.add(patient_profile)
    db.commit()
    db.refresh(patient_profile)

    # 4. Gamification Profile
    gamification = Gamification(
        patient_id=patient_profile.id,
        points=260,
        current_streak=5,
        highest_streak=7,
        last_activity_date=date.today().isoformat(),
        badges=json.dumps(["Health Pioneer", "Profile Complete", "7-Day Vitals Streak", "Report Explorer"])
    )
    db.add(gamification)

    # 5. Seed 14 Days of Vitals & Metrics
    base_date = datetime.utcnow() - timedelta(days=14)
    vitals_blueprint = [
        ("heart_rate", [72, 74, 71, 75, 70, 73, 72, 74, 76, 71, 73, 70, 72, 71], "bpm"),
        ("bp_systolic", [122, 120, 118, 124, 121, 119, 122, 120, 125, 121, 118, 120, 122, 119], "mmHg"),
        ("bp_diastolic", [82, 80, 78, 83, 80, 79, 81, 80, 84, 80, 78, 80, 81, 79], "mmHg"),
        ("blood_glucose", [94, 96, 92, 98, 95, 93, 97, 94, 99, 95, 91, 93, 96, 94], "mg/dL"),
        ("weight", [73.2, 73.0, 72.8, 72.9, 72.7, 72.6, 72.5, 72.6, 72.4, 72.5, 72.4, 72.5, 72.3, 72.5], "kg"),
        ("water_ml", [1900, 2100, 1850, 2200, 2400, 2000, 2150, 1950, 2300, 2200, 2050, 2400, 2250, 2350], "ml"),
        ("sleep_hours", [7.2, 6.8, 7.5, 8.0, 7.0, 6.5, 7.8, 7.3, 7.6, 8.1, 7.4, 7.0, 7.7, 7.5], "hours"),
        ("steps", [5800, 7200, 6400, 8900, 9500, 6100, 7800, 8200, 9100, 10200, 7300, 6900, 8400, 8750], "steps")
    ]

    for m_type, val_series, unit in vitals_blueprint:
        for idx, val in enumerate(val_series):
            recorded_time = base_date + timedelta(days=idx, hours=9)
            metric = HealthMetric(
                patient_id=patient_profile.id,
                metric_type=m_type,
                value=float(val),
                unit=unit,
                recorded_at=recorded_time,
                notes="Daily log entry"
            )
            db.add(metric)

    # 6. Seed Prescribed Medications
    meds = [
        Medication(
            patient_id=patient_profile.id,
            medicine_name="Atorvastatin",
            dosage="10mg",
            frequency="Once daily at bedtime",
            reminder_time="21:30",
            start_date=(date.today() - timedelta(days=30)).isoformat(),
            end_date=(date.today() + timedelta(days=60)).isoformat(),
            refills_left=2,
            notes="Take with or without water. Prescribed for preventive cholesterol management."
        ),
        Medication(
            patient_id=patient_profile.id,
            medicine_name="Vitamin D3",
            dosage="2000 IU",
            frequency="Once daily morning",
            reminder_time="08:30",
            start_date=(date.today() - timedelta(days=15)).isoformat(),
            end_date=(date.today() + timedelta(days=45)).isoformat(),
            refills_left=1,
            notes="Take after breakfast."
        ),
        Medication(
            patient_id=patient_profile.id,
            medicine_name="Cetirizine",
            dosage="10mg",
            frequency="As needed (PRN)",
            reminder_time="20:00",
            start_date=(date.today() - timedelta(days=10)).isoformat(),
            end_date=None,
            refills_left=3,
            notes="Take during acute seasonal allergy flares."
        )
    ]
    for m in meds:
        db.add(m)
    db.commit()

    # Seed Medication Logs for the last 3 days
    for m in meds[:2]:
        for d_offset in range(3):
            log_date = date.today() - timedelta(days=d_offset)
            m_log = MedicationLog(
                medication_id=m.id,
                patient_id=patient_profile.id,
                scheduled_time=f"{log_date.isoformat()} {m.reminder_time}",
                status="taken"
            )
            db.add(m_log)

    # 7. Seed Appointments with QR Codes
    cardio_doc = created_doctors[0]
    next_week_date = (date.today() + timedelta(days=3)).isoformat()
    apt_code = f"APT-{uuid.uuid4().hex[:8].upper()}"
    
    qr_data = generate_appointment_qr_base64({
        "code": apt_code,
        "patient": patient_profile.name,
        "doctor": cardio_doc.name,
        "specialty": cardio_doc.specialization,
        "date": next_week_date,
        "time": "10:30",
        "hospital": cardio_doc.hospital_name
    })

    upcoming_apt = Appointment(
        appointment_code=apt_code,
        patient_id=patient_profile.id,
        doctor_id=cardio_doc.id,
        appointment_date=next_week_date,
        appointment_time="10:30",
        status="confirmed",
        reason="Annual cardiovascular routine checkup and lipid test review.",
        consultation_type="in_person",
        patient_notes="Mild occasional palpitations after intense workouts.",
        qr_code_data=qr_data
    )
    db.add(upcoming_apt)

    # Past completed appointment
    past_date = (date.today() - timedelta(days=20)).isoformat()
    past_code = f"APT-{uuid.uuid4().hex[:8].upper()}"
    past_apt = Appointment(
        appointment_code=past_code,
        patient_id=patient_profile.id,
        doctor_id=created_doctors[5].id, # Dr. Amit Roy (General Medicine)
        appointment_date=past_date,
        appointment_time="14:00",
        status="completed",
        reason="Follow up on seasonal allergy symptoms.",
        consultation_type="in_person",
        doctor_notes="Patient is doing well. Lungs clear to auscultation. Recommended continuing Cetirizine as needed.",
        prescription_notes="Cetirizine 10mg PRN. Stay well hydrated."
    )
    db.add(past_apt)

    # 8. Seed Digital Health Record with AI Summary
    ai_sample_summary = {
        "document_title": "Comprehensive Lipid & Metabolic Profile",
        "document_type": "Lipid Panel (Cholesterol Test)",
        "important_information": "Parsed 6 clinical biomarkers from your Lipid Panel. Identified 1 parameter slightly elevated compared to reference range.",
        "plain_language_explanation": "Your blood test reveals overall strong cardiovascular metrics. Your Total Cholesterol is marginally above baseline, while HDL (protective cholesterol) remains at a healthy level. This is a common finding and easily modulated with diet and activity.",
        "biomarkers": [
            {"marker": "Total Cholesterol", "observed_value": 208.0, "reference_range": "120 - 200", "unit": "mg/dL", "system": "Lipid Profile", "status": "Elevated", "status_color": "rose"},
            {"marker": "HDL ('Good') Cholesterol", "observed_value": 52.0, "reference_range": "40 - 80", "unit": "mg/dL", "system": "Lipid Profile", "status": "Normal", "status_color": "emerald"},
            {"marker": "LDL ('Bad') Cholesterol", "observed_value": 98.0, "reference_range": "50 - 100", "unit": "mg/dL", "system": "Lipid Profile", "status": "Normal", "status_color": "emerald"},
            {"marker": "Triglycerides", "observed_value": 138.0, "reference_range": "50 - 150", "unit": "mg/dL", "system": "Lipid Profile", "status": "Normal", "status_color": "emerald"},
            {"marker": "Fasting Blood Glucose", "observed_value": 92.0, "reference_range": "70 - 99", "unit": "mg/dL", "system": "Metabolic", "status": "Normal", "status_color": "emerald"},
            {"marker": "Glycated Hemoglobin (HbA1c)", "observed_value": 5.2, "reference_range": "4.0 - 5.6", "unit": "%", "system": "Endocrine", "status": "Normal", "status_color": "emerald"}
        ],
        "requiring_discussion": ["Total Cholesterol is slightly elevated (208.0 mg/dL vs 120-200 standard reference)."],
        "questions_to_ask_doctor": [
            "Does my slightly elevated total cholesterol require dietary changes or medication?",
            "How does my HDL/LDL ratio look in relation to long-term heart health?",
            "When should I repeat this lipid profile?"
        ],
        "safety_note": "Medical Safety Reminder: Out-of-reference laboratory values require clinical correlation by a physician."
    }

    sample_record = HealthRecord(
        patient_id=patient_profile.id,
        category="lab_report",
        title="Comprehensive Lipid & Metabolic Profile",
        file_url="/uploads/demo_lab_report.pdf",
        file_type="pdf",
        file_size_kb=345.2,
        ai_summary=json.dumps(ai_sample_summary),
        ai_questions=json.dumps(ai_sample_summary["questions_to_ask_doctor"]),
        doctor_notes="Reviewed during checkup. Recommended continuing Mediterranean diet."
    )
    db.add(sample_record)

    # 9. Seed Symptom Assessment Session
    sample_symptom_result = {
        "risk_level": "Caution",
        "category": "Monitor Closely",
        "color": "sky",
        "summary": "Your symptoms of headache with mild nausea are consistent with tension or mild migraine. Rest and hydration recommended.",
        "red_flags": [],
        "possible_explanations": [{"name": "Tension Headache", "score": 1.8}, {"name": "Migraine", "score": 2.0}],
        "recommended_specialties": ["Neurology", "General Medicine"],
        "questions_for_doctor": ["Could screen time be causing these headaches?", "Are there preventive lifestyle adjustments?"],
        "disclaimer": "Informational only. Not a medical diagnosis."
    }

    symptom_sess = SymptomSession(
        patient_id=patient_profile.id,
        symptoms_json=json.dumps(["Headache with nausea", "Fatigue and weakness"]),
        duration="1-2 days",
        severity="Moderate",
        risk_level="Caution",
        assessment_result=json.dumps(sample_symptom_result)
    )
    db.add(symptom_sess)

    # 10. Seed Notifications
    notifs = [
        Notification(
            user_id=patient_user.id,
            title="Appointment Confirmed",
            message=f"Your consultation with Dr. Sarah Sharma is confirmed for {next_week_date} at 10:30 AM.",
            notification_type="appointment",
            priority="high",
            is_read=False
        ),
        Notification(
            user_id=patient_user.id,
            title="Medication Reminder",
            message="Time to take Vitamin D3 2000 IU with breakfast.",
            notification_type="medication",
            priority="medium",
            is_read=True
        ),
        Notification(
            user_id=patient_user.id,
            title="AI Lab Report Summary Ready",
            message="Your Lipid & Metabolic Profile has been processed and summarized by Medicare-AI.",
            notification_type="report",
            priority="medium",
            is_read=True
        ),
        Notification(
            user_id=patient_user.id,
            title="Welcome to Medicare-AI",
            message="Your smart health companion is ready. Complete your daily vitals to maintain your tracking streak.",
            notification_type="system",
            priority="low",
            is_read=True
        )
    ]
    for n in notifs:
        db.add(n)

    # 11. Seed Audit Logs
    audit1 = AuditLog(user_id=admin.id, action="SYSTEM_INIT", resource="DATABASE", details="System initialized and seeded with demo data")
    audit2 = AuditLog(user_id=patient_user.id, action="LOGIN", resource="USERS", details="Patient logged in")
    db.add(audit1)
    db.add(audit2)

    db.commit()
    db.close()
    print("Demo data successfully seeded!")

if __name__ == "__main__":
    seed_database()
