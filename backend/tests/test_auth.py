def test_root_and_health(client):
    r1 = client.get("/")
    assert r1.status_code == 200
    assert r1.json()["project"] == "Medicare-AI"

    r2 = client.get("/api/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "healthy"

def test_login_patient_success(client):
    payload = {
        "email": "patient@medicare.ai",
        "password": "Patient@123"
    }
    resp = client.post("/api/auth/login", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "patient"
    assert data["email"] == "patient@medicare.ai"

def test_login_doctor_success(client):
    payload = {
        "email": "doctor@medicare.ai",
        "password": "Doctor@123"
    }
    resp = client.post("/api/auth/login", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "doctor"

def test_login_invalid_password(client):
    payload = {
        "email": "patient@medicare.ai",
        "password": "WrongPassword!"
    }
    resp = client.post("/api/auth/login", json=payload)
    assert resp.status_code == 401
