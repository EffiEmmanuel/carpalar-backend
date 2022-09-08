import mongoose from "mongoose";

export const OTPModel = mongoose.model('OTP', mongoose.Schema({
    code: {
        type: String,
        expires: '5m',
        required: true,
    },

    driverId: {
        type: mongoose.Types.ObjectId,
        ref: 'Driver',
        required: true
    }
}, { timestamps: true }))