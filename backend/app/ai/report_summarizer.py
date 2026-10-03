"""
Medical Report AI Summarizer
Parses lab documents (PDF, text, images), extracts biomarkers, flags out-of-range parameters,
and translates complex medical jargon into easy-to-understand explanations and doctor discussion points.
"""
from typing import Dict, Any, List, Optional
import re
import os
import pypdf

# Clinical biomarker reference dictionary
BIOMARKER_STANDARDS = {
    "hemoglobin": {"name": "Hemoglobin (Hb)", "min": 12.0, "max": 17.5, "unit": "g/dL", "system": "Hematology"},
    "wbc": {"name": "White Blood Cell Count (WBC)", "min": 4000, "max": 11000, "unit": "/mcL", "system": "Immune System"},
    "platelets": {"name": "Platelet Count", "min": 150000, "max": 450000, "unit": "/mcL", "system": "Hematology"},
    "fasting glucose": {"name": "Fasting Blood Glucose", "min": 70, "max": 99, "unit": "mg/dL", "system": "Metabolic"},
    "glucose": {"name": "Blood Glucose", "min": 70, "max": 140, "unit": "mg/dL", "system": "Metabolic"},
    "hba1c": {"name": "Glycated Hemoglobin (HbA1c)", "min": 4.0, "max": 5.6, "unit": "%", "system": "Endocrine"},
    "cholesterol": {"name": "Total Cholesterol", "min": 120, "max": 200, "unit": "mg/dL", "system": "Lipid Profile"},
    "ldl": {"name": "LDL ('Bad') Cholesterol", "min": 50, "max": 100, "unit": "mg/dL", "system": "Lipid Profile"},
    "hdl": {"name": "HDL ('Good') Cholesterol", "min": 40, "max": 80, "unit": "mg/dL", "system": "Lipid Profile"},
    "triglycerides": {"name": "Triglycerides", "min": 50, "max": 150, "unit": "mg/dL", "system": "Lipid Profile"},
    "creatinine": {"name": "Serum Creatinine", "min": 0.6, "max": 1.2, "unit": "mg/dL", "system": "Renal / Kidney"},
    "tsh": {"name": "Thyroid Stimulating Hormone (TSH)", "min": 0.4, "max": 4.0, "unit": "mIU/L", "system": "Endocrine"},
}

class ReportSummarizerService:
    def extract_text_from_file(self, file_path: str, file_type: str) -> str:
        """Extract plain text from uploaded PDF or text file."""
        text = ""
        try:
            if file_type.lower() == "pdf":
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
            else:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
        except Exception as e:
            text = f"[Text extraction error: {str(e)}]"

        return text.strip()

    def summarize(self, document_text: str, document_title: str = "Medical Report") -> Dict[str, Any]:
        """Analyze extracted document text and produce structured patient-friendly summary."""
        doc_lower = document_text.lower()
        
        # Identify document category
        doc_category = "General Medical Report"
        if "lipid" in doc_lower or "cholesterol" in doc_lower:
            doc_category = "Lipid Panel (Cholesterol Test)"
        elif "complete blood count" in doc_lower or "cbc" in doc_lower or "hemoglobin" in doc_lower:
            doc_category = "Complete Blood Count (CBC)"
        elif "metabolic" in doc_lower or "glucose" in doc_lower or "hba1c" in doc_lower:
            doc_category = "Metabolic & Diabetes Panel"
        elif "thyroid" in doc_lower or "tsh" in doc_lower:
            doc_category = "Thyroid Function Test"
        elif "kidney" in doc_lower or "renal" in doc_lower or "creatinine" in doc_lower:
            doc_category = "Renal / Kidney Function Profile"
        elif "prescription" in doc_lower or "rx" in doc_lower:
            doc_category = "Clinical Prescription"

        # Search for biomarkers and values using regex patterns
        extracted_markers: List[Dict[str, Any]] = []
        flags: List[str] = []

        for key, info in BIOMARKER_STANDARDS.items():
            # Pattern matching: marker name followed by optional colon/whitespace and numeric value
            pattern = rf"(?i)\b{re.escape(key)}\b[^\d\n\r]*?(\d+(?:\.\d+)?)"
            match = re.search(pattern, document_text)
            if match:
                try:
                    val = float(match.group(1))
                    status = "Normal"
                    status_color = "emerald"

                    if val < info["min"]:
                        status = "Below Reference Range"
                        status_color = "amber"
                        flags.append(f"{info['name']} is lower than standard reference ({val} {info['unit']} vs {info['min']}-{info['max']}).")
                    elif val > info["max"]:
                        status = "Elevated"
                        status_color = "rose"
                        flags.append(f"{info['name']} is elevated ({val} {info['unit']} vs {info['min']}-{info['max']}).")

                    extracted_markers.append({
                        "marker": info["name"],
                        "observed_value": val,
                        "reference_range": f"{info['min']} - {info['max']}",
                        "unit": info["unit"],
                        "system": info["system"],
                        "status": status,
                        "status_color": status_color
                    })
                except (ValueError, IndexError):
                    continue

        # If no specific biomarkers extracted by regex, provide sensible analysis based on content
        if not extracted_markers:
            findings_summary = (
                "The report contains general clinical observations, diagnostic impressions, or doctor notes. "
                "No standard numeric lab biomarkers (such as CBC or Lipid panels) were explicitly detected."
            )
            plain_explanation = (
                "This document appears to be a clinical consult note, prescription, or descriptive scan summary. "
                "Review the doctor's specific recommendations and follow-up directives."
            )
        else:
            findings_summary = (
                f"Successfully parsed {len(extracted_markers)} clinical biomarkers from your {doc_category}. "
                f"Found {len(flags)} parameter(s) outside standard laboratory reference intervals."
            )
            plain_explanation = (
                "Your test was compared against standard clinical laboratory benchmarks. "
                "Numbers outside reference ranges are common and can be influenced by time of day, hydration, "
                "diet, stress, or medications. They do NOT definitively indicate disease, but are valuable discussion points for your doctor."
            )

        # Questions to ask the doctor
        questions = [
            f"Are any of these findings concerning in the context of my medical history?",
            "Do any out-of-range values require repeat testing or follow-up imaging?",
            "What lifestyle or dietary adjustments would help optimize these parameters?",
            "When should I schedule my next follow-up checkup?"
        ]

        return {
            "document_title": document_title,
            "document_type": doc_category,
            "important_information": findings_summary,
            "plain_language_explanation": plain_explanation,
            "biomarkers": extracted_markers,
            "requiring_discussion": flags if flags else ["All identified parameters are within standard reference intervals."],
            "questions_to_ask_doctor": questions,
            "safety_note": (
                "Medical Safety Reminder: Out-of-reference laboratory values require clinical correlation by a "
                "physician. Never self-adjust prescribed medications or attempt independent treatments based solely on automated summaries."
            )
        }

report_summarizer_service = ReportSummarizerService()
