const express = require("express");
const { auth } = require("../middlewares/authMiddleware");
const {
    bookAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    getPatientAcceptedDoctors,
    getDoctorAcceptedPatients // <-- Import the new controller function
} = require("../controller/appointmentController");

const router = express.Router();
console.log("bookAppointment:", typeof bookAppointment);
console.log("getDoctorAppointments:", typeof getDoctorAppointments);
console.log("updateAppointmentStatus:", typeof updateAppointmentStatus);
console.log("getPatientAcceptedDoctors:", typeof getPatientAcceptedDoctors);
console.log("getDoctorAcceptedPatients:", typeof getDoctorAcceptedPatients); // Check new function availability

router.post("/book", auth, bookAppointment);
router.get("/doctorappointment", auth, getDoctorAppointments);
router.patch("/:id", auth, updateAppointmentStatus);

// Route for PATIENT to get their accepted DOCTORS (Existing)
router.get("/patient-doctors", auth, getPatientAcceptedDoctors); 

// --- FINAL NEW ROUTE: Route for DOCTOR to get their accepted PATIENTS ---
// This endpoint matches the one used in the mobile app's fetch call.
router.get("/doctor-patients", auth, getDoctorAcceptedPatients); 
// ----------------------------------------------------------------------

module.exports = router;