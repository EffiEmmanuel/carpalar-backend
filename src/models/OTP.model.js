import mongoose from "mongoose";

export const OTPModel = mongoose.model('OTP', mongoose.Schema({
    code: {
        type: String,
        required: true,
    },

    driverId: {
        type: mongoose.Types.ObjectId,
        ref: 'Driver',
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    }

}, { timestamps: true }))