"""
AI Conversational Health Assistant Service
Provides contextual, safe healthcare decision support with emergency detection,
follow-ups, and plain-language medical explanations.
"""
from typing import List, Dict, Any, Optional
import httpx
from app.config import settings

SAFETY_DISCLAIMER = (
    "⚠️ Medical Disclaimer: Medicare-AI provides health information and decision support, "
    "not a definitive diagnosis or medical prescription. Always consult a qualified physician."
)

EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "can't breathe", "difficulty breathing",
    "shortness of breath", "severe bleeding", "unconscious", "stroke",
    "sudden numbness", "slurred speech", "coughing blood", "suicidal",
    "poison", "anaphylaxis", "severe allergic reaction", "overdose"
]

class HealthAssistantService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    async def get_response(
        self,
        messages: List[Dict[str, str]],
        patient_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process user query and return safety-compliant health response.
        Uses external LLM if API key is present; otherwise uses our rule-based expert engine.
        """
        latest_user_message = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                latest_user_message = m.get("content", "")
                break

        # Check for immediate life-threatening emergency triggers
        is_emergency = any(kw in latest_user_message.lower() for kw in EMERGENCY_KEYWORDS)
        
        if is_emergency:
            return {
                "reply": (
                    "🚨 **POTENTIAL MEDICAL EMERGENCY DETECTED**\n\n"
                    "The symptoms you described may require **immediate medical evaluation**.\n\n"
                    "• **Action Required:** Please call your local emergency service (e.g. 112 / 911 / 102) immediately or go to the nearest emergency room.\n"
                    "• **Notify Help:** Please alert a family member or tap the **Emergency Mode** button on your dashboard to reach your emergency contact.\n\n"
                    "Do not wait for symptoms to worsen.\n\n" + SAFETY_DISCLAIMER
                ),
                "is_emergency": True,
                "follow_up_questions": [
                    "Are you in a safe place with someone nearby?",
                    "Can you reach your emergency contact or nearest hospital right now?"
                ],
                "suggested_actions": ["activate_emergency_mode", "find_emergency_hospital"]
            }

        # Try Gemini API if key is present
        if self.gemini_key:
            try:
                external_reply = await self._call_gemini(messages, patient_context)
                if external_reply:
                    return {
                        "reply": f"{external_reply}\n\n{SAFETY_DISCLAIMER}",
                        "is_emergency": False,
                        "follow_up_questions": self._generate_follow_ups(latest_user_message)
                    }
            except Exception:
                pass  # Fall back to internal expert engine

        # Try OpenAI API if key is present
        if self.openai_key:
            try:
                external_reply = await self._call_openai(messages, patient_context)
                if external_reply:
                    return {
                        "reply": f"{external_reply}\n\n{SAFETY_DISCLAIMER}",
                        "is_emergency": False,
                        "follow_up_questions": self._generate_follow_ups(latest_user_message)
                    }
            except Exception:
                pass

        # Smart Clinical Inference & Fallback Engine
        return self._generate_expert_response(latest_user_message, messages, patient_context)

    def _generate_expert_response(
        self,
        query: str,
        history: List[Dict[str, str]],
        patient_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        q = query.lower()
        context_str = ""
        if patient_context:
            age = patient_context.get("age")
            conditions = patient_context.get("existing_conditions")
            if age:
                context_str += f" (Age: {age})"
            if conditions:
                context_str += f" | Known conditions: {conditions}"

        # Topic matching
        if any(w in q for w in ["fever", "temperature", "chills"]):
            reply = (
                "🌡️ **Fever Guidance & Observation**\n\n"
                "A fever is typically an immune response fighting off an infection (viral or bacterial).\n\n"
                "**What you should do:**\n"
                "1. **Hydration:** Drink plenty of fluids (water, herbal teas, oral rehydration solutions).\n"
                "2. **Rest:** Allow your body time to recuperate.\n"
                "3. **Monitor:** Check temperature every 4-6 hours with a clean digital thermometer.\n\n"
                "**When to seek immediate medical attention:**\n"
                "• Temperature exceeding 103°F (39.4°C) or lasting more than 3 consecutive days.\n"
                "• Severe headache, stiff neck, confusion, or difficulty breathing."
            )
            follow_ups = [
                "How many days has the fever been present?",
                "Are you experiencing any other symptoms such as chills, cough, or body ache?"
            ]

        elif any(w in q for w in ["headache", "head pain", "migraine"]):
            reply = (
                "🧠 **Headache Analysis & Self-Care Information**\n\n"
                "Headaches are common and often stem from tension, dehydration, eye strain, lack of sleep, or sinus inflammation.\n\n"
                "**Helpful Steps:**\n"
                "• Drink 1-2 glasses of water to rule out dehydration.\n"
                "• Rest in a quiet, dimly-lit room and step away from digital screens.\n"
                "• Apply a cool cloth or gentle warm compress to your forehead or temples.\n\n"
                "**Red Flags Requiring Medical Evaluation:**\n"
                "• Sudden, extremely severe headache ('thunderclap' sensation).\n"
                "• Headache accompanied by visual disturbances, nausea, stiff neck, or numbness."
            )
            follow_ups = [
                "Is the pain concentrated on one side, or across your entire forehead?",
                "Did the headache start suddenly or gradually?"
            ]

        elif any(w in q for w in ["cough", "cold", "sore throat", "sneezing", "congestion"]):
            reply = (
                "🫁 **Upper Respiratory Care Guidance**\n\n"
                "Cough and throat irritation are frequently triggered by common viral infections or seasonal allergies.\n\n"
                "**Supportive Measures:**\n"
                "• Warm salt water gargles 2-3 times daily to soothe throat tissues.\n"
                "• Inhale steam and use a room humidifier.\n"
                "• Sip warm water with honey or soothing warm tea.\n\n"
                "**Seek Doctor Consultation If:**\n"
                "• The cough lasts longer than 2 weeks.\n"
                "• You develop shortness of breath, wheezing, or cough up colored or bloody mucus."
            )
            follow_ups = [
                "Is the cough dry or are you coughing up phlegm?",
                "Do you have an accompanying fever or wheezing?"
            ]

        elif any(w in q for w in ["stomach", "abdomen", "acid", "gastric", "diarrhea", "nausea"]):
            reply = (
                "🥗 **Gastrointestinal Wellness Advice**\n\n"
                "Abdominal discomfort is often related to dietary triggers, indigestion, gastritis, or mild gastroenteritis.\n\n"
                "**Recommendations:**\n"
                "• Consume bland, easy-to-digest foods (e.g. bananas, rice, toast, broths).\n"
                "• Avoid spicy, greasy, or acidic foods and dairy products temporarily.\n"
                "• Sip oral rehydration salts (ORS) or electrolyte water frequently in small sips.\n\n"
                "**Seek Medical Attention If:**\n"
                "• Severe, sharp pain radiating to the lower right abdomen or back.\n"
                "• Inability to keep liquids down for over 24 hours, or blood in stool."
            )
            follow_ups = [
                "Where specifically is the discomfort located in your stomach?",
                "Have you experienced any vomiting or diarrhea?"
            ]

        elif any(w in q for w in ["blood pressure", "hypertension", "bp"]):
            reply = (
                "💓 **Blood Pressure Information**\n\n"
                "Blood pressure is an essential cardiovascular indicator. Normal resting blood pressure for adults is generally around 120/80 mmHg.\n\n"
                "• **Lifestyle Factors:** Regular physical activity, low-sodium balanced diet, stress management, and adequate sleep help support healthy pressure.\n"
                "• **Recording:** Log readings in your Medicare-AI Vitals Tracker at the same time daily, resting for 5 minutes beforehand.\n"
                "• **Consultation:** If your systolic reading consistently stays above 140 or diastolic above 90, consult a cardiologist or primary physician for clinical review."
            )
            follow_ups = [
                "What was your most recent blood pressure reading?",
                "Are you currently prescribed any blood pressure medication?"
            ]

        elif any(w in q for w in ["hello", "hi", "hey", "greetings"]):
            reply = (
                "👋 **Hello! I am Medicare-AI, your intelligent health companion.**\n\n"
                "I can assist you with:\n"
                "• Understanding health concerns and symptoms\n"
                "• Explaining medical lab terms in simple words\n"
                "• Suggesting appropriate medical specialties to consult\n"
                "• Providing evidence-based wellness & self-care information\n\n"
                "How are you feeling today? Please share what's on your mind."
            )
            follow_ups = [
                "I'd like to check some symptoms I'm experiencing.",
                "Can you explain a medical test result?",
                "How do I book an appointment with a doctor?"
            ]

        else:
            reply = (
                f"Thank you for sharing your concern{context_str}.\n\n"
                "To give you the most accurate healthcare guidance, please consider sharing:\n"
                "• How long you have noticed these symptoms\n"
                "• The intensity (mild, moderate, or severe)\n"
                "• Any other symptoms occurring at the same time\n\n"
                "Medicare-AI is designed to support your healthcare journey and connect you with qualified doctors for diagnosis and treatment plans."
            )
            follow_ups = [
                "Could this be related to stress or lifestyle changes?",
                "Which doctor specialty should I consult for this?",
                "What home care measures can I take safely?"
            ]

        return {
            "reply": f"{reply}\n\n{SAFETY_DISCLAIMER}",
            "is_emergency": False,
            "follow_up_questions": follow_ups
        }

    def _generate_follow_ups(self, user_msg: str) -> List[str]:
        return [
            "How long have you had this concern?",
            "Are there any other symptoms accompanying this?",
            "Would you like recommendations on which doctor specialty to consult?"
        ]

    async def _call_gemini(self, messages: List[Dict[str, str]], patient_context: Optional[Dict[str, Any]]) -> Optional[str]:
        # Formulate prompt for Gemini
        system_instruction = (
            "You are Medicare-AI, an empathetic and certified-grade healthcare AI assistant. "
            "Follow strict medical safety: Never provide definitive medical diagnoses, never prescribe dosages. "
            "Always include safe self-care, warning signs, and recommend consulting a licensed medical professional. "
            "Keep explanations plain-language and compassionate."
        )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        contents = []
        for m in messages:
            contents.append({
                "role": "user" if m.get("role") == "user" else "model",
                "parts": [{"text": m.get("content", "")}]
            })
        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800}
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        return None

    async def _call_openai(self, messages: List[Dict[str, str]], patient_context: Optional[Dict[str, Any]]) -> Optional[str]:
        system_prompt = (
            "You are Medicare-AI, an intelligent healthcare decision-support assistant. "
            "Never declare definitive diagnosis. Recommend qualified doctor review. Provide safe wellness guidance."
        )
        formatted_msgs = [{"role": "system", "content": system_prompt}] + messages
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.openai_key}"}
        payload = {
            "model": "gpt-4o-mini",
            "messages": formatted_msgs,
            "temperature": 0.3,
            "max_tokens": 800
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        return None

health_assistant_service = HealthAssistantService()
