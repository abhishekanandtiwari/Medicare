"""
Personalized Wellness Insights Engine
Delivers non-diagnostic, holistic observations on sleep consistency, hydration goals,
vital trends, and medication adherence.
"""
from typing import List, Dict, Any

class WellnessInsightsEngine:
    def generate_insights(
        self,
        metrics: List[Dict[str, Any]],
        medication_adherence_pct: float = 100.0,
        patient_name: str = "User"
    ) -> List[Dict[str, Any]]:
        insights: List[Dict[str, Any]] = []

        # Analyze water intake
        water_logs = [m["value"] for m in metrics if m.get("metric_type") == "water_ml"]
        if water_logs:
            avg_water = sum(water_logs) / len(water_logs)
            if avg_water < 2000:
                insights.append({
                    "category": "Hydration",
                    "icon": "Droplets",
                    "title": "Hydration Goal Opportunity",
                    "observation": f"Your recorded average daily water intake is {int(avg_water)} ml.",
                    "recommendation": "Aiming for 2,000–2,500 ml daily helps optimize energy levels, digestion, and cognitive focus.",
                    "type": "tip"
                })
            else:
                insights.append({
                    "category": "Hydration",
                    "icon": "CheckCircle2",
                    "title": "Great Hydration Consistency",
                    "observation": f"You're averaging {int(avg_water)} ml of daily hydration.",
                    "recommendation": "Maintain this healthy routine to support kidney function and overall cellular health.",
                    "type": "positive"
                })

        # Analyze sleep duration
        sleep_logs = [m["value"] for m in metrics if m.get("metric_type") == "sleep_hours"]
        if sleep_logs:
            avg_sleep = sum(sleep_logs) / len(sleep_logs)
            sleep_variance = max(sleep_logs) - min(sleep_logs) if len(sleep_logs) > 1 else 0
            
            if sleep_variance > 2.5:
                insights.append({
                    "category": "Sleep Routine",
                    "icon": "Moon",
                    "title": "Sleep Schedule Variation",
                    "observation": f"Your recorded sleep duration fluctuated by {round(sleep_variance, 1)} hours across recent entries.",
                    "recommendation": "Maintaining a regular bedtime and wake time helps strengthen your circadian rhythm and daytime alertness.",
                    "type": "attention"
                })
            elif avg_sleep < 6.5:
                insights.append({
                    "category": "Sleep Routine",
                    "icon": "Moon",
                    "title": "Rest Deficit Detected",
                    "observation": f"Your recorded sleep averaged {round(avg_sleep, 1)} hours.",
                    "recommendation": "Most adults benefit from 7–9 hours of sleep nightly. Consider limiting blue light exposure 45 minutes before sleep.",
                    "type": "attention"
                })
            else:
                insights.append({
                    "category": "Sleep Routine",
                    "icon": "Sparkles",
                    "title": "Balanced Sleep Duration",
                    "observation": f"You are averaging {round(avg_sleep, 1)} hours of rest nightly.",
                    "recommendation": "Consistent restorative rest is one of the strongest predictors of immune health.",
                    "type": "positive"
                })

        # Analyze Blood Pressure
        bp_sys = [m["value"] for m in metrics if m.get("metric_type") == "bp_systolic"]
        bp_dia = [m["value"] for m in metrics if m.get("metric_type") == "bp_diastolic"]
        if bp_sys and bp_dia:
            latest_sys = bp_sys[-1]
            latest_dia = bp_dia[-1]
            if latest_sys > 135 or latest_dia > 88:
                insights.append({
                    "category": "Cardiovascular",
                    "icon": "HeartPulse",
                    "title": "Elevated Blood Pressure Reading",
                    "observation": f"Your latest reading was {int(latest_sys)}/{int(latest_dia)} mmHg.",
                    "recommendation": "Multiple factors like sodium, stress, or caffeine can elevate readings temporarily. Log consistently and share trends with your doctor.",
                    "type": "attention"
                })
            else:
                insights.append({
                    "category": "Cardiovascular",
                    "icon": "Heart",
                    "title": "Healthy Blood Pressure Range",
                    "observation": f"Latest resting reading {int(latest_sys)}/{int(latest_dia)} mmHg is within target range.",
                    "recommendation": "Keep up regular light cardio and wholesome nutrition to preserve cardiovascular fitness.",
                    "type": "positive"
                })

        # Analyze Medication Adherence
        if medication_adherence_pct < 80.0:
            insights.append({
                "category": "Medication",
                "icon": "Pill",
                "title": "Medication Adherence Alert",
                "observation": f"Your current medication adherence rate is {int(medication_adherence_pct)}%.",
                "recommendation": "Setting an alarm or syncing with the Medicare-AI push notification reminder can help prevent missed doses.",
                "type": "attention"
            })
        else:
            insights.append({
                "category": "Medication",
                "icon": "Award",
                "title": "Outstanding Medication Consistency",
                "observation": f"You have achieved {int(medication_adherence_pct)}% adherence to scheduled prescriptions.",
                "recommendation": "Consistency is vital for therapeutic efficacy. Keep it up!",
                "type": "positive"
            })

        # General wellness tip if few metrics logged
        if len(insights) < 2:
            insights.append({
                "category": "Daily Activity",
                "icon": "Flame",
                "title": "Active Movement",
                "observation": "Regular physical activity improves cardiovascular endurance and mood.",
                "recommendation": "Aim for a brisk 20-30 minute walk today to boost circulation and metabolic vitality.",
                "type": "tip"
            })

        return insights

wellness_insights_engine = WellnessInsightsEngine()
