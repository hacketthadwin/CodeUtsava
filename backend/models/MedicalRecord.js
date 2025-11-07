const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicalRecordSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    number: {
      type: String,
      required: true,
    },

    // Store the entire Gemini / Parser / Rider outputs as raw JSON
    gemini_output: {
      type: Schema.Types.Mixed, // allows any JSON structure
      default: {},
    },
    parser_output: {
      type: Schema.Types.Mixed,
      default: {},
    },
    rider_output: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Optional — extracted clean structured data for easier filtering
    timestamp: {
      type: Date,
      default: Date.now,
    },
    patient: {
      patient_id: String,
      patient_name: String,
      age: Number,
      sex: String,
    },
    vitals: {
      bp_systolic: Number,
      bp_diastolic: Number,
      pulse_bpm: Number,
      temperature_c: Number,
      spo2_percent: Number,
    },
    diagnoses: [String],
    past_medical_history: [String],
    allergies: [String],
    current_medications: [String],
    medicinal_recommendations: {
      Final_Group_Adv: String,
      Output: String,
      Adverse_Effects: String,
    },
    general_recommendations: {
      alert: {
        status: String,
        bp_systolic: Number,
        bp_diastolic: Number,
        hypertension_grade: String,
        message: String,
      },
      exercise_plan: [String],
      daily_routine: [String],
      general_health_tips: [String],
    },
    parser_metadata: {
      parser_version: String,
      ocr_engine: String,
      language_model: String,
      accuracy_confidence: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
