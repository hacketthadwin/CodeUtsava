"""
rider.py — Auto HTN Detection + Brand → Category Mapping + Flexible Rule Engine
Supports 'HTN Gr' formats like 'Gr II-III' and standard 'stage_2' format.
"""

import json
import os
import re

# -----------------------------
# CONFIG (FIXED RELATIVE PATHS)
# -----------------------------
# Dynamically get the root directory where rider.py is located (Code_Utsava/)
RIDER_ROOT = os.path.dirname(os.path.abspath(__file__)) 
DATA_FOLDER = os.path.join(RIDER_ROOT, "health_ai_core", "data")

# Assign dynamic paths to the global variables
COMBINED_PATH = os.path.join(DATA_FOLDER, "combined_output.json")
BRAND_MAP_PATH = os.path.join(DATA_FOLDER, "brand_drug_map.json") # ✅ Corrected
HTN_RULE_MAP_PATH = os.path.join(DATA_FOLDER, "map.json")
OUTPUT_PATH = os.path.join(DATA_FOLDER, "final_combined_with_rider.json")

# -----------------------------
# HELPERS
# -----------------------------
def load_json(path):
    if not os.path.exists(path):
        # This exception is what you were seeing
        raise FileNotFoundError(f"❌ JSON not found: {path}") 
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# -----------------------------
# BLOOD PRESSURE → STAGE
# -----------------------------
def detect_hypertension_stage(vitals):
    sys_bp = vitals.get("systolic_bp") or vitals.get("bp_systolic")
    dia_bp = vitals.get("diastolic_bp") or vitals.get("bp_diastolic")

    if not sys_bp or not dia_bp:
        print("⚠️ BP missing — defaulting to stage_2.")
        return "stage_2"

    sys_bp, dia_bp = int(sys_bp), int(dia_bp)
    if sys_bp < 120 and dia_bp < 80:
        return "normal"
    if 120 <= sys_bp <= 129 and dia_bp < 80:
        return "elevated"
    if (130 <= sys_bp <= 139) or (80 <= dia_bp <= 89):
        return "stage_1"
    if (140 <= sys_bp <= 179) or (90 <= dia_bp <= 119):
        return "stage_2"
    if sys_bp >= 180 or dia_bp >= 120:
        return "resistant"
    return "stage_2"

# -----------------------------
# NORMALIZE 'Gr II' STYLE → 'stage_2'
# -----------------------------
def normalize_grade_label(label: str):
    if not label:
        return "stage_2"

    text = str(label).strip().lower()
    text = text.replace("grade", "gr").replace("–", "-").replace("_", "-").replace(" ", "")
    roman_to_stage = {
        "i": "stage_1",
        "ii": "stage_2",
        "iii": "resistant",
        "iv": "resistant"
    }

    m = re.search(r"gr([ivx]+)([-/\\s]*([ivx]+))?", text)
    if m:
        primary = m.group(1).lower()
        secondary = (m.group(3) or "").lower()
        if "iii" in (primary, secondary):
            return "resistant"
        elif "ii" in (primary, secondary):
            return "stage_2"
        elif "i" in (primary, secondary):
            return "stage_1"

    n = re.search(r"gr?([0-9]+)", text)
    if n:
        num = int(n.group(1))
        if num == 1:
            return "stage_1"
        if num == 2:
            return "stage_2"
        if num >= 3:
            return "resistant"

    return "stage_2"

# -----------------------------
# BRAND → TAG MAPPING
# -----------------------------
def extract_brand_names(med_list):
    brands = []
    for med in med_list:
        if isinstance(med, dict):
            val = med.get("name") or med.get("drug") or ""
        else:
            val = str(med)
        val = re.sub(r"\(.*?\)", "", val).strip()
        if not val:
            continue
        brand = val.split(" ")[0].upper()
        if brand not in brands:
            brands.append(brand)
    return brands

def get_tags_from_brands(brand_list, brand_map):
    tags = set()
    for b in brand_list:
        entry = brand_map.get(b.upper())
        if not entry:
            continue
        for t in entry.get("tags", []):
            tags.add(t.upper().strip())
    return sorted(list(tags))

# -----------------------------
# RULE ENGINE (supports 'HTN Gr')
# -----------------------------
def find_hypertension_plan(grade, tags, htn_map):
    grade_norm = normalize_grade_label(grade)
    tags_u = [t.upper().strip() for t in tags]

    # Case 1: map.json is list
    if isinstance(htn_map, list):
        for entry in htn_map:
            entry_grade = entry.get("HTN Gr") or entry.get("grade") or ""
            entry_norm = normalize_grade_label(entry_grade)
            req_tags = [
                k for k, v in entry.items()
                if v == "y" and k.upper() in ["CCB", "RASI", "DIURETICS", "BB", "MRA", "AB", "CA"]
            ]
            req_tags = [t.upper().strip() for t in req_tags]
            missing = [r for r in req_tags if r not in tags_u]

            if entry_norm == grade_norm and not missing:
                return {
                    "Final Group Adv": entry.get("Final group adv"),
                    "Output": entry.get("Output ") or entry.get("Output"),
                    "Adverse Effects": entry.get("Adverse effect and correction ") or entry.get("Adverse")
                }

    # Case 2: map.json is dict (legacy)
    elif isinstance(htn_map, dict):
        for k, v in htn_map.items():
            k_norm = normalize_grade_label(k)
            if k_norm == grade_norm:
                for combo, rule in v.items():
                    req = rule.get("required_tags", [])
                    if all(r.upper() in tags_u for r in req):
                        return {
                            "Final Group Adv": combo,
                            "Output": rule.get("suggestion"),
                            "Adverse Effects": rule.get("adverse")
                        }

    # Fallback
    return {
        "Final Group Adv": "CCB + ARB or ACEI + Diuretic + MRA",
        "Output": "Amlodipine + Telmisartan + Spironolactone",
        "Adverse Effects": "Monitor for hyperkalemia and hypotension"
    }

# -----------------------------
# MAIN EXECUTION
# -----------------------------
def merge_medicinal_recommendations():
    print("🚀 Generating Medicinal Recommendations...")

    combined = load_json(COMBINED_PATH)
    brand_map = load_json(BRAND_MAP_PATH)
    htn_map = load_json(HTN_RULE_MAP_PATH)

    vitals = combined.get("vitals", {})
    grade = detect_hypertension_stage(vitals)
    print(f"🩺 Detected Hypertension Grade: {grade.upper()}")

    med_list = combined.get("current_medications", [])
    brands = extract_brand_names(med_list)
    print(f"💊 Brands found: {brands}")

    tags = get_tags_from_brands(brands, brand_map)
    print(f"🧩 Detected drug categories: {tags}")

    plan = find_hypertension_plan(grade, tags, htn_map)
    combined["medicinal_recommendations"] = {
        "Final Group Adv": plan["Final Group Adv"],
        "Output": plan["Output"],
        "Adverse Effects": plan["Adverse Effects"]
    }

    save_json(OUTPUT_PATH, combined)
    print(f"✅ Saved final output → {OUTPUT_PATH}\n")
    print(json.dumps(combined["medicinal_recommendations"], indent=2))

# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    merge_medicinal_recommendations()

# -------------- WRAPPER for FastAPI -----------------
def generate_final_recommendation(input_path: str):
    """Wrapper to match main.py interface"""
    global COMBINED_PATH
    COMBINED_PATH = input_path
    merge_medicinal_recommendations()
    with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)