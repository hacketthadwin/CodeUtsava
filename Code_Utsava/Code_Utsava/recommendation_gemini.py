"""
gemini_recommender.py — Generate Overall (Non-Medicinal) Recommendations + BP Alert

Pipeline:
    combined_output.json → rider.py → final_combined_with_rider.json → gemini_recommender.py → final_output_with_gemini.json

Output:
{
  "Overall Recommendations": {
    "alert": { ... },      # optional, shown only if BP is high
    "exercise_plan": [...],
    "daily_routine": [...],
    "general_health_tips": [...]
  }
}
"""

import os
import json
from google import genai

# -----------------------------
# CONFIG
# -----------------------------
BASE_DIR = r"C:\Users\atsj6\OneDrive\Desktop\Code_Utsava\health_ai_core\data"
INPUT_FILE = os.path.join(BASE_DIR, "final_combined_with_rider.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "final_output_with_gemini.json")
MODEL_NAME = "gemini-2.0-flash"

# -----------------------------
# HELPERS
# -----------------------------
def load_json(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ Input JSON not found at {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_api_key():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise EnvironmentError(
            "❌ GEMINI_API_KEY not found. Run:\n"
            '   $env:GEMINI_API_KEY="YOUR_REAL_API_KEY"\n'
            "to set it for this session."
        )
    return key

# -----------------------------
# BP ALERT DETECTOR
# -----------------------------
def detect_bp_alert(vitals: dict) -> dict:
    if not vitals:
        return {}

    systolic = vitals.get("bp_systolic")
    diastolic = vitals.get("bp_diastolic")
    if not systolic or not diastolic:
        return {}

    alert = {}
    grade = None
    message = None

    if systolic >= 180 or diastolic >= 110:
        grade = "Stage 3 (Severe Hypertension)"
        message = "⚠️ Hypertensive crisis suspected — immediate medical attention required!"
    elif systolic >= 140 or diastolic >= 90:
        grade = "Stage 2 Hypertension"
        message = "High BP detected — combination therapy and close monitoring recommended."
    elif systolic >= 130 or diastolic >= 80:
        grade = "Stage 1 Hypertension"
        message = "Mild hypertension — consult a physician for early management."
    elif systolic >= 120 and diastolic < 80:
        grade = "Elevated Blood Pressure"
        message = "Slightly elevated BP — adopt low-salt diet and exercise regularly."
    else:
        return {}

    alert = {
        "status": "alert",
        "bp_systolic": systolic,
        "bp_diastolic": diastolic,
        "hypertension_grade": grade,
        "message": message
    }
    return alert

# -----------------------------
# MAIN FUNCTION
# -----------------------------
def main():
    print("🚀 Generating Overall Health & Lifestyle Recommendations...\n")

    # 1️⃣ Load combined data
    combined = load_json(INPUT_FILE)
    print(f"✅ Loaded file: {INPUT_FILE}")

    # 2️⃣ Initialize Gemini
    api_key = get_api_key()
    client = genai.Client(api_key=api_key)
    print("✅ Gemini client initialized.\n")

    # 3️⃣ Detect BP Alert
    vitals = combined.get("vitals", {})
    alert_data = detect_bp_alert(vitals)
    if alert_data:
        print(f"⚠️ BP Alert: {alert_data['hypertension_grade']} — {alert_data['message']}")
    else:
        print("✅ BP within normal range.")

    # 4️⃣ Build prompt — Lifestyle, Exercise & Wellbeing Only
    prompt = f"""
You are a certified medical AI assistant specialized in holistic health and lifestyle guidance.

Below is structured patient data including vitals, medical history, and medicinal recommendations:
{json.dumps(combined, indent=2)}

Your task:
Provide evidence-based, safe, and patient-specific recommendations in the following structured JSON format:

{{
  "Overall Recommendations": {{
    "exercise_plan": [ "Specific, safe physical activities or movement suggestions" ],
    "daily_routine": [ "Healthy lifestyle or habit-building advice" ],
    "general_health_tips": [ "Preventive and long-term wellness guidance" ]
  }}
}}

Rules:
- DO NOT include any medicinal recommendations (they are handled by a separate engine).
- Focus ONLY on exercise, lifestyle, and wellbeing aspects.
- Keep the tone supportive and simple.
- Output clean JSON only — no markdown, no ```json fences.
"""

    # 5️⃣ Call Gemini API
    try:
        print("🤖 Sending structured request to Gemini model...")
        response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
        result_text = getattr(response, "text", str(response))
        print("✅ Gemini model response received.\n")
    except Exception as e:
        print(f"❌ Gemini API call failed: {e}")
        return

    # 6️⃣ Parse Gemini output cleanly
    try:
        cleaned_text = (
            result_text.replace("```json", "")
            .replace("```", "")
            .strip()
        )
        gemini_output = json.loads(cleaned_text)
        overall = gemini_output.get("Overall Recommendations", {})
    except json.JSONDecodeError:
        print("⚠️ Model did not return valid JSON, saving raw output.")
        overall = {"text_output": result_text}

    # 7️⃣ Add BP Alert (if any)
    if alert_data:
        overall["alert"] = alert_data

    # 8️⃣ Merge and Save
    combined["Overall Recommendations"] = overall
    save_json(OUTPUT_FILE, combined)
    print(f"✅ Final output saved to: {OUTPUT_FILE}\n")

    print("🎯 Overall Recommendations:")
    print(json.dumps(overall, indent=2))

# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    main()

# -------------- WRAPPER for FastAPI -----------------
def generate_gemini_recommendation(input_path: str, output_path: str):
    """Wrapper for FastAPI to use Gemini recommender dynamically"""
    global INPUT_FILE, OUTPUT_FILE
    INPUT_FILE = input_path
    OUTPUT_FILE = output_path
    main()
    with open(output_path, "r", encoding="utf-8") as f:
        return json.load(f)

