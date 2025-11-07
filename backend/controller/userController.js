const bcrypt = require('bcrypt');
const User = require('../models/userModel'); 
// 🔑 Import the dedicated OTP Model
const OTP = require('../models/otpModel'); 
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

require('dotenv').config();

// ===========================================
// ✉️ Utility: Send Email with OTP
// ===========================================
const mailTransporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

const sendMail = async (email, otp) => {
    try {
        const mailDetails = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your One-Time Password (OTP) for Authentication',
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                     <h2 style="color: #333;">OTP for Account Verification</h2>
                     <p>Your one-time password (OTP) is:</p>
                     <p style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">${otp}</p>
                     <p>This code is valid for <strong>5 minutes</strong>. It will automatically expire.</p>
                   </div>`,
        };
        const info = await mailTransporter.sendMail(mailDetails);
        console.log("Email sent successfully. Message ID:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email via Nodemailer:", error.message || error);
        return false;
    }
};

// ===========================================
// 📝 STEP 1: Send OTP for Signup/Login (POST /send-otp)
// ===========================================
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const otp = otpGenerator.generate(6, { 
            upperCaseAlphabets: false, 
            lowerCaseAlphabets: false, 
            specialChars: false 
        });

        // 1. Clean up any previous unverified OTPs for this email 
        await OTP.deleteMany({ email });
        
        // 2. Create the new OTP record (TTL index handles expiration)
        const otpRecord = await OTP.create({ email, otp: String(otp) });

        console.log(`New OTP generated for ${email}: ${otp}. Expires: ${otpRecord.createdAt.getTime() + 5 * 60 * 1000}`);

        // 3. Send the OTP via email
        const mailResult = await sendMail(email, otp);

        if (!mailResult) {
            // If email fails, delete the OTP record immediately
            await OTP.deleteOne({ _id: otpRecord._id }); 
            return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please check server logs for SMTP error.' });
        }

        // Check if the user exists for the frontend logic (isNewUser detection)
        const userExists = await User.exists({ email });

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email successfully. It expires in 5 minutes.',
            isNewUser: !userExists
        });

    } catch (err) {
        console.error("Server error during OTP generation:", err.message || err);
        return res.status(500).json({
            success: false,
            message: "Server error during OTP generation. Check console for details.",
        });
    }
};

// ===========================================
// 🟢 NEW CONTROLLER: Login with Password (POST /login-password)
// ===========================================
exports.loginWithPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required for login" });
        }

        // 1. Find the User record
        const user = await User.findOne({ email }).select('+password'); // Explicitly select the hashed password
        
        if (!user || !user.password) {
            // Check if user exists or if they only have an incomplete profile without a password
            return res.status(401).json({ success: false, message: "Invalid credentials or account not fully registered." });
        }

        // 2. Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // 3. Create JWT payload and token (Same logic as OTP login)
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Prepare user object for response (remove password before sending)
        const userResponse = user.toObject();
        userResponse.password = undefined; 
        
        // 4. Respond with token and user data
        return res.status(200).json({
            success: true,
            message: "User logged in successfully (Password Verified)",
            token, 
            user: {
                _id: userResponse._id,
                name: userResponse.name,
                email: userResponse.email,
                role: userResponse.role,
                address: userResponse.address,
                phone: userResponse.phone,
                age: userResponse.age,
                gender: userResponse.gender,
                language: userResponse.language,
                degree: userResponse.degree, 
                registrationNumber: userResponse.registrationNumber, 
            },
        });

    } catch (err) {
        console.error("Password Login Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error during password login",
        });
    }
};

// ===========================================
// 📝 STEP 2a: Finalize Signup (Verify OTP & Register) (POST /signup)
// ===========================================
exports.signup = async (req, res) => {
    try {
        const {
            name, email, password, role, address, phone, age, gender, language,
            degree, registrationNumber, otp,
        } = req.body;

        if (!name || !email || !password || !role || !address || !phone || !age || !gender || !language || !otp) {
            return res.status(400).json({ success: false, message: "All common fields and OTP are required for signup." });
        }
        
        // 1. Verify OTP using the dedicated OTP model
        const otpRecord = await OTP.findOne({ email, otp: String(otp) });

        if (!otpRecord) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        // 2. OTP is valid: Delete the OTP record immediately to prevent reuse
        await OTP.deleteOne({ _id: otpRecord._id });
        
        // 3. Check/Handle existing user record
        let user = await User.findOne({ email });
        
        // If user already exists and is fully registered, block signup
        if (user && user.password && user.password.length > 50) {
            return res.status(400).json({ success: false, message: "Account already fully registered. Please sign in." });
        }
        
        // Check for duplicate phone number
        const existingPhoneUser = await User.findOne({ phone });
        if (existingPhoneUser && existingPhoneUser._id.toString() !== user?._id.toString()) {
             return res.status(400).json({ success: false, message: 'User with this phone number already exists' });
        }

        // 4. Hash password and register/update
        const hashedPassword = await bcrypt.hash(password, 10);
        
        if (user) {
            // Case: User created a temporary record in 'sendOTP', now update it with full details.
            user.name = name;
            user.password = hashedPassword;
            user.role = role;
            user.address = address;
            user.phone = phone;
            user.age = parseInt(age, 10); 
            user.gender = gender;
            user.language = language;
            user.degree = role === 'Doctor' ? degree : undefined; 
            user.registrationNumber = role === 'Doctor' ? registrationNumber : undefined;
            
            await user.save();

        } else {
            // Case: Brand new user
            user = await User.create({
                name, email, password: hashedPassword, role, address, phone,
                age: parseInt(age, 10), gender, language,
                degree: role === 'Doctor' ? degree : undefined, 
                registrationNumber: role === 'Doctor' ? registrationNumber : undefined,
            });
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully and verified",
            data: user.toObject({ getters: true, virtuals: false }),
        });
    } catch (err) {
        console.error("Signup/Verify OTP Error:", err);
        
        if (err.message && err.message.includes('Doctors must have')) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            const message = field === 'registrationNumber' 
                ? 'A user with this registration number already exists.' 
                : `A user with this ${field} already exists.`;
            return res.status(400).json({ success: false, message: message });
        }
        return res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
};

// ===========================================
// 📝 STEP 2b: Finalize Login (Verify OTP & Issue Token) (POST /login)
// ===========================================
exports.login = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required for login" });
        }

        // 1. Find the User record 
        let user = await User.findOne({ email }); 
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found. Please signup." });
        }
        
        // Ensure the user has actually completed the registration
        if (!user.password || user.password.length < 50) { 
            return res.status(401).json({ success: false, message: "Account setup is incomplete. Please complete signup." });
        }

        // 2. Verify OTP using the dedicated OTP model
        const otpRecord = await OTP.findOne({ email, otp: String(otp) });

        if (!otpRecord) {
            return res.status(403).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        // 3. OTP is valid: Delete the OTP record immediately to prevent reuse
        await OTP.deleteOne({ _id: otpRecord._id });

        // 4. Create JWT payload and token
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Prepare user object for response
        user = user.toObject();
        user.password = undefined; 
        
        // 5. Respond with token and user data
        return res.status(200).json({
            success: true,
            message: "User logged in successfully (OTP Verified)",
            token, 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                phone: user.phone,
                age: user.age,
                gender: user.gender,
                language: user.language,
                degree: user.degree, 
                registrationNumber: user.registrationNumber, 
            },
        });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error during login/OTP verification",
        });
    }
};

// ===========================================
// 📝 Update Profile Controller (Existing) (PUT /user/profile)
// ===========================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id; 
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication failed. User ID missing." });
        }

        const { name, email, phone } = req.body;

        if (!name && !email && !phone) {
            return res.status(400).json({ message: "No fields provided for update." });
        }

        const updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
        if (phone) updateFields.phone = phone;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true, runValidators: true } 
        ).select('-password -__v'); 

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser.toObject({ getters: true, virtuals: false }),
        });

    } catch (error) {
        console.error("Error updating user profile:", error);
        
        if (error.code === 11000) {
             const field = Object.keys(error.keyValue)[0];
             return res.status(409).json({ success: false, message: `This ${field} is already associated with another account.` });
        }
        
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: error.message });
        }
        
        res.status(500).json({ success: false, message: "Server error during profile update." });
    }
};

// =========================
// EXPORTS
// =========================
module.exports = {
    sendOTP: exports.sendOTP,
    signup: exports.signup,
    login: exports.login,
    // CRITICAL: Export the new controller function
    loginWithPassword: exports.loginWithPassword,
    updateProfile: exports.updateProfile, 
};