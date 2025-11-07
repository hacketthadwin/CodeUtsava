const express = require('express');
const router = express.Router();
const {
  postSymptom,
  getSymptoms,
  getSymptomByNumber,
} = require('../controller/medicalRecordController');

// 🩺 Create new record
router.post('/post-symptom', postSymptom);

// 📋 Get all records (optional email/number filter)
router.get('/get-symptom', getSymptoms);

// 🔍 Get record(s) by mobile number
router.get('/get-symptom/:number', getSymptomByNumber);

module.exports = router;
