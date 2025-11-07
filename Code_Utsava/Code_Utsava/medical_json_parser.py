import os
import re
import json
import hashlib
import datetime
import pdfplumber
from PIL import Image
import pytesseract

# -------------------------------
# CONFIG
# -------------------------------
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# -------------------------------
# HELPERS (Remain the same)
# -------------------------------
def file_exists(path: str) -> bool:
    return bool(path) and os.path.exists(path)

def read_pdf_text(path: str) -> str:
    if not file_exists(path):
        return ""
    try:
        with pdfplumber.open(path) as pdf:
            return "\n".join([p.extract_text() or "" for p in pdf.pages])
    except Exception:
        return ""

def ocr_image_text(path: str) -> str:
    if not file_exists(path):
        return ""
    try:
        img = Image.open(path)
        return pytesseract.image_to_string(img)
    except Exception:
        return ""

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


# -------------------------------
# EXTRACTORS (Remain the same)
# -------------------------------
def extract_vitals(text: str) -> dict:
    vit = {}
    bp = re.search(r"\bBP[:\s\-]*([0-9]{2,3})\s*\/\s*([0-9]{2,3})\b", text, re.IGNORECASE)
    if bp:
        vit["bp_systolic"] = int(bp.group(1))
        vit["bp_diastolic"] = int(bp.group(2))
    hr = re.search(r"\b(?:HR|Heart Rate|Pulse)[:\s]*([0-9]{2,3})\b", text, re.IGNORECASE)
    if hr:
        vit["pulse_bpm"] = int(hr.group(1))
    spo2 = re.search(r"\b(?:SpO2|Oxygen Saturation)[:\s]*([0-9]{2,3})\b", text, re.IGNORECASE)
    if spo2:
        vit["spo2_percent"] = int(spo2.group(1))
    temp = re.search(r"\b(?:Temp|Temperature)[:\s]*([0-9]{2,3}\.?[0-9]*)", text, re.IGNORECASE)
    if temp:
        vit["temperature_c"] = float(temp.group(1))
    return vit


def classify_hypertension(systolic, diastolic):
    if systolic is None or diastolic is None:
        return "unknown"
    if systolic >= 180 or diastolic >= 120:
        return "resistant"
    if systolic >= 140 or diastolic >= 90:
        return "stage_2"
    if 130 <= systolic < 140 or 80 <= diastolic < 90:
        return "stage_1"
    if 120 <= systolic < 130 and diastolic < 80:
        return "elevated"
    return "normal"


def extract_medications(text: str) -> list:
    meds = []
    rx = re.compile(r"([A-Za-z][A-Za-z0-9\- ]{2,60})\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units))", re.IGNORECASE)
    for line in text.splitlines():
        m = rx.search(line.strip())
        if m:
            name, dose = m.group(1).strip(), m.group(2).strip()
            meds.append(f"{name} {dose}")
    return list(dict.fromkeys(meds))


def extract_labs(text: str) -> dict:
    labs = {}
    patterns = [
        (r"Total Cholesterol[:\s]*([0-9]{2,4})", "total_cholesterol_mgdl"),
        (r"HDL[:\s]*([0-9]{1,3})", "hdl_mgdl"),
        (r"LDL[:\s]*([0-9]{1,3})", "ldl_mgdl"),
        (r"Triglycerides[:\s]*([0-9]{1,4})", "triglycerides_mgdl"),
        (r"Fasting Glucose[:\s]*([0-9]{2,3})", "fasting_glucose_mgdl")
    ]
    for pat, key in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            labs[key] = float(m.group(1))
    return labs


def extract_diagnoses(text: str) -> list:
    diags = []
    m = re.search(r"(?:Diagnosis|Diagnoses|Impression)[:\s]*([^\n\r]+)", text, re.IGNORECASE)
    if m:
        diags = [x.strip() for x in re.split(r",|;|\band\b", m.group(1)) if len(x.strip()) > 2]
    return diags


def extract_pmh(text: str) -> list:
    m = re.search(r"(?:Past Medical History|Medical History)[:\s]*(.*)", text, re.IGNORECASE)
    if m:
        return [x.strip() for x in re.split(r",|;|\band\b", m.group(1)) if len(x.strip()) > 2]
    return []


# -------------------------------
# CORE BUILDER LOGIC (Renamed to process_inputs_core)
# -------------------------------
def process_inputs_core(form_data: dict, file_paths: list, output_path: str) -> dict:
    """
    Core function to combine form data, file data, and generate initial combined JSON.
    NOTE: The form_data received here must be pre-unpacked by main.py.
    """
    text_data = []
    for f in (file_paths or []):
        ext = os.path.splitext(f)[1].lower()
        if ext == ".pdf":
            text_data.append(read_pdf_text(f))
        elif ext in (".png", ".jpg", ".jpeg"):
            text_data.append(ocr_image_text(f))

    text = normalize_text("\n".join(text_data))

    # Vitals: Extract via OCR/Regex, then override/fill with form data
    vit = extract_vitals(text)
    vit.update({k: form_data.get(k, vit.get(k)) for k in ["bp_systolic", "bp_diastolic", "pulse_bpm", "temperature_c", "spo2_percent"]})
    grade = classify_hypertension(vit.get("bp_systolic"), vit.get("bp_diastolic"))

    # Medication/History: Prioritize form data that was unpacked by main.py
    
    # Check if structured medication list was provided by the client (via main.py's unpacking)
    client_med_list = form_data.get("medication_list", [])
    if client_med_list and isinstance(client_med_list, list):
        current_meds = [f"{m.get('name', '')} {m.get('dosage', '')}" for m in client_med_list]
    else:
        current_meds = extract_medications(text)
    
    # Past Medical History: Prefer the history string entered by the user
    client_pmh_str = form_data.get("medical_history", "")
    if client_pmh_str:
        past_med_history = [s.strip() for s in re.split(r",|;|\band\b", client_pmh_str) if len(s.strip()) > 2]
    else:
        past_med_history = extract_pmh(text)
        
        
    result = {
        "patient_id": form_data.get("patient_id", "PR_" + hashlib.md5(str(datetime.datetime.now()).encode()).hexdigest()[:8]),
        "patient_name": form_data.get("patient_name", "Unknown"),
        "age": form_data.get("age"),
        "sex": form_data.get("sex"),
        "report_source": {
            "file_name": os.path.basename(file_paths[0]) if file_paths else None,
            "source_type": [os.path.splitext(f)[1].lstrip('.') for f in (file_paths or [])] or ["form"],
            "extraction_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        },
        "vitals": vit,
        "hypertension_grade": grade,
        # The 'symptoms' field now takes the simple list prepared in main.py
        "symptoms": form_data.get("symptoms", []), 
        "diagnoses": extract_diagnoses(text),
        "past_medical_history": past_med_history,
        "current_medications": current_meds,
        "lab_results": extract_labs(text),
        "parser_metadata": {
            "parser_version": "v4.1.1",
            "ocr_engine": "tesseract-5.4.0",
            "language_model": "regex",
            "accuracy_confidence": 0.90
        }
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    return result

# ------------------------------------------------------
# 🟢 CORRECTED WRAPPER for FastAPI
# ------------------------------------------------------
def process_inputs(form_data: dict, file_paths: list, output_path: str):
    """Wrapper used by main.py to call the core logic."""
    # The fix is calling the renamed core function:
    return process_inputs_core(form_data, file_paths, output_path)