def test_symptom_autocomplete_trie(client):
    resp = client.get("/api/symptoms/autocomplete?q=head")
    assert resp.status_code == 200
    data = resp.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) > 0
    assert any("Headache" in s["name"] for s in data["suggestions"])

def test_symptom_analyzer(client):
    login_resp = client.post("/api/auth/login", json={"email": "patient@medicare.ai", "password": "Patient@123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "symptoms": ["Headache with nausea", "Fever"],
        "duration": "1-2 days",
        "severity": "Moderate"
    }
    resp = client.post("/api/symptoms/analyze", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "risk_level" in data
    assert "category" in data
    assert "possible_explanations" in data
    assert "questions_for_doctor" in data
    assert "disclaimer" in data
