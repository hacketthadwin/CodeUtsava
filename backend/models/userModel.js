const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Doctor', 'Patient'],
        required: true,
    },
    // --- Doctor-Specific Fields ---
    degree: {
        type: String,
    },
    registrationNumber: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null/missing values (for patients)
    }
}, { timestamps: true });

// ✅ Conditional Validation (Verification) Logic
userSchema.pre('save', function(next) {
    // Check if the role is 'Doctor'
    if (this.role === 'Doctor') {
        // 1. Verify 'degree' is present
        if (!this.degree || this.degree.trim() === '') {
            return next(new Error('Doctors must have a degree specified.'));
        }
        // 2. Verify 'registrationNumber' is present
        if (!this.registrationNumber || this.registrationNumber.trim() === '') {
            return next(new Error('Doctors must have a medical registration number.'));
        }
    }
    // If validation passes (or user is Patient), proceed to save
    next();
});

module.exports = mongoose.model('User', userSchema);