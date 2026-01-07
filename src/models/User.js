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
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    email: {
        type: String,
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
