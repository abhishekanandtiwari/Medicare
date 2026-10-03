"""
Symptom Assessment Engine
Combines Graph-based clinical relationship traversal and rule-based multi-factor evaluation
to deliver safe, categorical healthcare guidance.
"""
from typing import List, Dict, Any, Optional
from app.dsa.graph import medical_graph

RED_FLAG_SYMPTOMS = {
    "chest pain", "shortness of breath", "acute lower right abdominal pain",
    "cough with blood", "sudden loss of vision", "numbness in face or arm",
    "severe dizziness with fainting", "sudden rash with facial swelling", "head injury"
}

MODERATE_CONCERN_SYMPTOMS = {
    "high fever with chills", "headache with nausea", "abdominal pain",
    "difficulty swallowing", "palpitations / rapid heartbeat", "blurred vision"
}

class SymptomAnalyzerService:
    def analyze(
        self,
        symptoms: List[str],
        duration: str,
        severity: str,
        patient_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate symptoms and generate structured decision support analysis.
        """
        if not symptoms:
            return {
                "risk_level": "Low",
                "category": "Insufficient Data",
                "summary": "Please select at least one symptom to evaluate.",
                "possible_explanations": [],
                "recommended_specialties": ["General Medicine"],
                "next_steps": ["Select symptoms to get an assessment."],
                "questions_for_doctor": []
            }

        symptoms_clean = [s.strip().lower() for s in symptoms]
        
        # Step 1: Check Red Flags
        detected_red_flags = [s for s in symptoms_clean if s in RED_FLAG_SYMPTOMS]
        detected_moderate = [s for s in symptoms_clean if s in MODERATE_CONCERN_SYMPTOMS]

        # Calculate risk score
        score = 0
        if detected_red_flags:
            score += 50 * len(detected_red_flags)
        if detected_moderate:
            score += 20 * len(detected_moderate)
        
        # Factor severity
        sev_lower = severity.lower()
        if "severe" in sev_lower:
            score += 30
        elif "moderate" in sev_lower:
            score += 15
        else:
            score += 5

        # Factor duration
        dur_lower = duration.lower()
        if "week" in dur_lower or "month" in dur_lower:
            score += 15
        elif "3-5" in dur_lower:
            score += 10

        # Step 2: Query Knowledge Graph for conditions and specialties
        graph_findings = medical_graph.explore_conditions_and_specialties(symptoms)

        # Categorize
        if score >= 60 or detected_red_flags:
            risk_category = "Seek Urgent Medical Attention"
            risk_badge = "Urgent"
            risk_color = "rose"
            guidance = (
                "Your reported symptoms contain high-priority clinical indicators that warrant "
                "prompt in-person medical evaluation to prevent complications."
            )
        elif score >= 35:
            risk_category = "Consider Medical Consultation"
            risk_badge = "Moderate"
            risk_color = "amber"
            guidance = (
                "Your symptoms have moderate persistence or severity. Booking a consultation with "
                "a doctor within the next 24-48 hours is recommended."
            )
        elif score >= 20:
            risk_category = "Monitor Closely"
            risk_badge = "Caution"
            risk_color = "sky"
            guidance = (
                "Your symptoms appear mild to moderate. Rest, hydrate, and monitor your vitals closely. "
                "If symptoms do not improve over the next 2-3 days, consult a physician."
            )
        else:
            risk_category = "General Information & Self-Care"
            risk_badge = "Low"
            risk_color = "emerald"
            guidance = (
                "Symptoms reported are generally consistent with mild temporary conditions. "
                "Practice good self-care, stay hydrated, and rest."
            )

        # Build differential possibilities (explicitly marked non-diagnostic)
        conditions_list = graph_findings.get("conditions", [])
        if not conditions_list:
            conditions_list = [
                {"name": "Viral Syndrome / Common Cold", "score": 1.0},
                {"name": "Temporary Fatigue / Tension", "score": 0.8}
            ]

        # Recommended specialties
        specialties = [sp["name"] for sp in graph_findings.get("specialties", [])]
        if not specialties:
            specialties = ["General Medicine"]

        # Questions for doctor
        questions = [
            f"What could be causing my {', '.join(symptoms[:2])}?",
            "Are there any specific tests (e.g. blood work or imaging) you would recommend?",
            "What symptoms should trigger an immediate hospital emergency visit?",
            "Are there any activities or dietary habits I should temporarily avoid?"
        ]

        # Related symptoms suggestions via graph
        related_symptoms = []
        for s in symptoms:
            related_symptoms.extend(medical_graph.get_related_symptoms(s))
        # Deduplicate and exclude existing
        unique_related = list(dict.fromkeys([rs for rs in related_symptoms if rs.lower() not in symptoms_clean]))[:4]

        return {
            "risk_level": risk_badge,
            "category": risk_category,
            "color": risk_color,
            "summary": guidance,
            "red_flags": [rf.title() for rf in detected_red_flags],
            "possible_explanations": conditions_list,
            "recommended_specialties": specialties,
            "related_symptoms_to_watch": unique_related,
            "questions_for_doctor": questions,
            "disclaimer": (
                "Medical Disclaimer: These assessments are generated for informational and decision-support "
                "purposes based on statistical and clinical knowledge models. They do not constitute a definitive "
                "medical diagnosis. Please discuss these findings with a licensed healthcare provider."
            )
        }

symptom_analyzer_service = SymptomAnalyzerService()
