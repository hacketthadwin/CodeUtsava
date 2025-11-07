const MedicalRecord = require('../models/MedicalRecord');

// 🩺 POST /api/records/post-symptom
exports.postSymptom = async (req, res) => {
  try {
    const { email, number, jsonData } = req.body;

    if (!email || !number || !jsonData) {
      return res.status(400).json({
        success: false,
        message: 'email, number, and jsonData are required',
      });
    }

    // Expect jsonData to contain nested Gemini/Parser/Rider outputs
    const { gemini_output, parser_output, rider_output } = jsonData;

    // Create a new record instance with both structured + raw JSON
    const record = new MedicalRecord({
      email,
      number,

      // Store full JSON blobs (Gemini, Parser, Rider)
      gemini_output,
      parser_output,
      rider_output,

      // Extract key details for indexing/searching
      patient: {
        patient_id:
          gemini_output?.patient_id ||
          parser_output?.patient_id ||
          rider_output?.patient_id ||
          null,
        patient_name:
          gemini_output?.patient_name ||
          parser_output?.patient_name ||
          rider_output?.patient_name ||
          null,
        age:
          gemini_output?.age ||
          parser_output?.age ||
          rider_output?.age ||
          null,
        sex:
          gemini_output?.sex ||
          parser_output?.sex ||
          rider_output?.sex ||
          null,
      },

      vitals:
        gemini_output?.vitals ||
        parser_output?.vitals ||
        rider_output?.vitals ||
        {},

      diagnoses:
        gemini_output?.diagnoses ||
        parser_output?.diagnoses ||
        rider_output?.diagnoses ||
        [],

      past_medical_history:
        gemini_output?.past_medical_history ||
        parser_output?.past_medical_history ||
        rider_output?.past_medical_history ||
        [],

      current_medications:
        gemini_output?.current_medications ||
        parser_output?.current_medications ||
        rider_output?.current_medications ||
        [],

      medicinal_recommendations:
        gemini_output?.medicinal_recommendations ||
        rider_output?.medicinal_recommendations ||
        {},

      general_recommendations:
        gemini_output?.Overall_Recommendations ||
        gemini_output?.OverallRecommendations ||
        gemini_output?.overall_recommendations ||
        {},

      parser_metadata:
        gemini_output?.parser_metadata ||
        parser_output?.parser_metadata ||
        rider_output?.parser_metadata ||
        {},
    });

    await record.save();

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: record,
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating record',
      error: error.message,
    });
  }
};

// 📋 GET /api/records/get-symptom
// Optional query: ?email=...&number=...
exports.getSymptoms = async (req, res) => {
  try {
    const { email, number } = req.query;
    const filter = {};
    if (email) filter.email = email;
    if (number) filter.number = number;

    const records = await MedicalRecord.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching symptom records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching records',
      error: error.message,
    });
  }
};

// 🔍 GET /api/records/get-symptom/:number
// Fetch records by patient mobile number
exports.getSymptomByNumber = async (req, res) => {
  try {
    const { number } = req.params;

    if (!number) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required in the URL parameter',
      });
    }

    const records = await MedicalRecord.find({ number }).sort({ createdAt: -1 });

    if (!records.length) {
      return res.status(404).json({
        success: false,
        message: 'No medical records found for this mobile number',
      });
    }

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching record by mobile number:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching by number',
      error: error.message,
    });
  }
};
