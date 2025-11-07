const express = require('express');
const router = express.Router();

// 🚨 Ensure all controller functions are imported
// CRITICAL FIX: Added 'loginWithPassword'
const { login, loginWithPassword, signup, updateProfile, sendOTP } = require('../controller/userController'); 

const { auth, isDoctor, isPatient } = require('../middlewares/authMiddleware');
const { createTask, getTasksLast7Days, updateTaskCompletion } = require('../controller/taskController');
const { newProblem, answerProblem, fetchProblem, getAllProblems } = require('../controller/communityController');
const { getAllUsers } = require('../controller/fetchUsers');

// --- Authentication Routes ---
// 1. Initial Step: Request OTP via email
router.post('/send-otp', sendOTP); 

// 2. Finalize Login: Verify OTP and issue JWT token (OTP Flow)
router.post('/login', login); 

// 3. 🟢 FIX: Login with Email and Password (Password Flow)
router.post('/login-password', loginWithPassword);

// 4. Finalize Signup: Verify OTP and create/complete user profile
router.post('/signup', signup); 

// Profile Update Route
router.put('/user/profile', auth, updateProfile); 

// --- Test & Role-Specific Routes ---
router.get('/test', auth, (req, res) => {
    res.status(200).json({ success: true, message: 'Protected route accessed successfully' });
});

router.get('/doctor', auth, isDoctor, (req, res) => {
    res.status(200).json({ success: true, message: 'Doctor route accessed successfully' });
});

router.get('/patient', auth, isPatient, (req, res) => {
    res.status(200).json({ success: true, message: 'Patient route accessed successfully' });
});

// --- Task Routes ---
router.post('/post-tasks', auth, createTask);
router.get('/get-7days-tasks', auth, getTasksLast7Days);
router.patch('/tasks/:id', auth, updateTaskCompletion);

// --- Community Routes ---
router.post('/community/problem', auth, newProblem);
router.post('/community/answer/:problemId', auth, answerProblem);
router.get('/community/problem/:id', fetchProblem);
router.get('/community/problems', getAllProblems);

// --- Appointment Routes ---
router.get('/book-appointment/users', auth, isPatient, getAllUsers);

module.exports = router;