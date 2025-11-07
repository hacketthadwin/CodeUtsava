const mongoose = require('mongoose'); // <--- CRITICAL FIX

const otpSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    otp: { 
        type: String, 
        required: true 
    },
    // TTL index for automatic expiration in 5 minutes (300 seconds)
    createdAt: { 
        type: Date, 
        default: Date.now, 
        index: { expires: 300 } 
    } 
});

module.exports = mongoose.model('OTP', otpSchema);