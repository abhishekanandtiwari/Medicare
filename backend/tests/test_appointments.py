def test_get_doctors(client):
    resp = client.get("/api/doctors")
    assert resp.status_code == 200
    doctors = resp.json()
    assert len(doctors) >= 5
    assert any(d["specialization"] == "Cardiology" for d in doctors)

def test_prevent_double_booking(client):
    # 1. Login as patient
    login_resp = client.post("/api/auth/login", json={"email": "patient@medicare.ai", "password": "Patient@123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get cardiology doctor
    doc_resp = client.get("/api/doctors")
    cardio_doc = [d for d in doc_resp.json() if d["specialization"] == "Cardiology"][0]

    # 3. Book slot on date 2026-11-20 at 11:00
    booking_payload = {
        "doctor_id": cardio_doc["id"],
        "appointment_date": "2026-11-20",
        "appointment_time": "11:00",
        "reason": "Cardiology screening",
        "consultation_type": "in_person"
    }

    first_booking = client.post("/api/appointments", json=booking_payload, headers=headers)
    assert first_booking.status_code == 200
    data = first_booking.json()
    assert "appointment_code" in data
    assert data["qr_code_data"].startswith("data:image/png;base64,")

    # 4. Attempt to book the EXACT SAME DOCTOR, DATE, and TIME
    duplicate_booking = client.post("/api/appointments", json=booking_payload, headers=headers)
    assert duplicate_booking.status_code == 409
    assert "already booked" in duplicate_booking.json()["detail"].lower()
