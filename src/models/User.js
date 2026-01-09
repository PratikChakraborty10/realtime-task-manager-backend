const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    idpUserId: {
        type: String,
        required: [true, 'IDP User ID is required'],
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: {
            values: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
            message: 'Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['USER', 'MANAGER', 'ACCOUNTANT', 'ADMIN'],
        default: 'USER'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
