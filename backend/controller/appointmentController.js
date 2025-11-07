const Appointment = require("../models/appointmentModel");

// Book appointment controller
const bookAppointment = async (req, res) => {
    try {
        const { doctorId, reason } = req.body;
        console.log("Received doctorId:", doctorId);
        console.log("Received reason:", reason);
        console.log("Authenticated user:", req.user); // req.user.id should be valid

        if (!doctorId || !reason) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newAppointment = await Appointment.create({
            doctorId,
            patientId: req.user.id,  // assuming auth middleware sets req.user
            reason,
        });

        res.status(201).json({ success: true, message: "Appointment booked", data: newAppointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all appointments for doctor (regardless of status)
const getDoctorAppointments = async (req, res) => {
    try {
        console.log("--- getDoctorAppointments Called ---");
        const doctorId = req.user.id;

        // Fetches ALL appointments for the doctor
        const appointments = await Appointment.find({ doctorId: doctorId }).populate("patientId");

        console.log("Number of appointments found:", appointments.length);

        res.status(200).json({ success: true, data: appointments });
    } catch (err) {
        console.error("Error in getDoctorAppointments:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- NEW FUNCTION: Get all accepted patients for the authenticated doctor (for chat list) ---
const getDoctorAcceptedPatients = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        // Find appointments where the doctor is the current user AND the status is 'accepted'
        const acceptedAppointments = await Appointment.find({
            doctorId: doctorId,
            status: 'accepted'
        })
        .populate({
            path: 'patientId', // Populate the patient details required by the chat list
            select: '_id name role email phone' // Ensure _id, name, and role are selected
        })
        .exec();

        // The frontend expects { success: true, data: [...] }
        return res.status(200).json({
            success: true,
            message: "Accepted patients retrieved successfully.",
            data: acceptedAppointments
        });

    } catch (error) {
        console.error("Error fetching accepted patients for doctor:", error);
        res.status(500).json({
            success: false,
            message: "Server error while retrieving accepted patients."
        });
    }
};

// Get all accepted doctors for the authenticated patient (existing function)
const getPatientAcceptedDoctors = async (req, res) => {
    try {
        const patientId = req.user.id;

        const acceptedAppointments = await Appointment.find({
            patientId: patientId,
            status: 'accepted'
        })
        .populate({
            // 🟢 CRITICAL FIX: Must select '_id' and 'role' for client-side mapping/filtering
            path: 'doctorId',
            select: '_id name role email degree registrationNumber' 
        })
        .exec();
        
        // Log the output here to confirm population (optional step, but useful for quick debugging)
        // console.log('Patient Doctors Population Check:', acceptedAppointments.slice(0, 2));

        return res.status(200).json({
            success: true,
            message: "Accepted doctors retrieved successfully.",
            data: acceptedAppointments
        });

    } catch (error) {
        console.error("Error fetching accepted doctors for patient:", error);
        res.status(500).json({
            success: false,
            message: "Server error while retrieving accepted doctors."
        });
    }
};

// Update appointment status 
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.status(200).json({ success: true, message: "Status updated", data: appointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Export them
module.exports = {
    bookAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    getPatientAcceptedDoctors,
    getDoctorAcceptedPatients, 
};