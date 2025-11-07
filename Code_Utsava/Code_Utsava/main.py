from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile, os, json, uvicorn
from dotenv import load_dotenv
import os 
import traceback

# ------------------------------------------------------
# FIX 1: Load Environment Variables from .env
# This must be done BEFORE any module tries to access os.getenv("GEMINI_API_KEY")
# ------------------------------------------------------
load_dotenv() 

# ------------------------------------------------------
# Import your local script functions
# ------------------------------------------------------
from medical_json_parser import process_inputs as run_parser
from rider import generate_final_recommendation as run_rider
from recommendation_gemini import generate_gemini_recommendation as run_gemini

# ------------------------------------------------------
# APP CONFIG
# ------------------------------------------------------
app = FastAPI(
    title="Health AI Backend",
    version="1.0",
    description="Combines form + PDF inputs → Parser → Rider → Gemini → Unified JSON"
)

# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # FIX: Ensure this is a standard space after the comma
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "health_ai_core", "data")

COMBINED_JSON = os.path.join(DATA_DIR, "combined_output.json")
RIDER_JSON = os.path.join(DATA_DIR, "final_combined_with_rider.json")
FINAL_JSON = os.path.join(DATA_DIR, "final_output_with_gemini.json")

os.makedirs(DATA_DIR, exist_ok=True)

# ------------------------------------------------------
# ROUTES
# ------------------------------------------------------

@app.get("/")
def root():
    """Health check endpoint"""
    return {"message": "✅ Health AI Backend running on port 8000"}


@app.post("/process")
async def process_pipeline(
    patient_name: str = Form(...),
    age: int = Form(...),
    sex: str = Form(...),
    bp_systolic: int = Form(None),
    bp_diastolic: int = Form(None),
    pulse_bpm: int = Form(None),
    temperature_c: float = Form(None),
    spo2_percent: int = Form(None),
    symptoms: str = Form("[]"),
    pdf_file: UploadFile = File(None)
):
    """
    Pipeline: 1. Form → Parser 2. Parser Output → Rider 3. Rider Output → Gemini
    """

    try:
        # ----------------------------
        # Step 1: Save uploaded file temporarily
        # ----------------------------
        uploaded_files = []
        if pdf_file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(pdf_file.filename)[1]) as tmp:
                tmp.write(await pdf_file.read())
                uploaded_files.append(tmp.name)

        # --------------------------------------------------
        # FIX 2: Unpack Complex Symptoms JSON and Restructure form_data
        # --------------------------------------------------
        
        # Parse the complex JSON string sent from the React Native 'symptoms' field
        symptoms_dict = json.loads(symptoms)

        # Build the final form_data payload for the internal parser scripts
        form_data = {
            # Core Fields from FastAPI Form
            "patient_name": patient_name,
            "age": age,
            "sex": sex,
            "bp_systolic": bp_systolic,
            "bp_diastolic": bp_diastolic,
            "pulse_bpm": pulse_bpm,
            "temperature_c": temperature_c,
            "spo2_percent": spo2_percent,
            
            # Additional Fields (Unpacked from the complex 'symptoms' JSON string)
            # 'symptoms' is changed to a list containing the app-provided title (for parser compatibility)
            "symptoms": [symptoms_dict.get("title")] if symptoms_dict.get("title") else [], 
            
            "medication_list": symptoms_dict.get("medication", []), 
            "medical_history": symptoms_dict.get("medical_history", ""),
            "additional_notes": symptoms_dict.get("additional_notes", ""),
            "date": symptoms_dict.get("date", ""),
            "title": symptoms_dict.get("title", ""),
        }
        
        # ----------------------------
        # Step 3: Parser → combined_output.json
        # ----------------------------
        print("🩺 Step 1: Running Parser...")
        combined_data = run_parser(form_data, uploaded_files, COMBINED_JSON)

        # ----------------------------
        # Step 4: Rider → final_combined_with_rider.json
        # ----------------------------
        print("💊 Step 2: Running Rider...")
        rider_output = run_rider(COMBINED_JSON)

        # ----------------------------
        # Step 5: Gemini → final_output_with_gemini.json
        # ----------------------------
        print("🧠 Step 3: Running Gemini...")
        gemini_output = run_gemini(RIDER_JSON, FINAL_JSON)

        # ----------------------------
        # Step 6: Combine all results
        # ----------------------------
        response = {
            "parser_output": combined_data,
            "rider_output": rider_output,
            "gemini_output": gemini_output
        }

        print("✅ Pipeline completed successfully.")
        return JSONResponse(content=response, status_code=200)

    except Exception as e:
        print(f"❌ Pipeline error: {e}")
        # Print full traceback for deep debugging
        traceback.print_exc()
        return JSONResponse(
            content={"error": f"Internal Server Error during pipeline: {str(e)}"},
            status_code=500
        )


# ------------------------------------------------------
# SERVER ENTRY POINT
# ------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)