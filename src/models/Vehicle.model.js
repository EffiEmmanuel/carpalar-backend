import mongoose from 'mongoose'

export const VehicleModel = new mongoose.model('Vehicle', mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    
    yearOfProduction: {
        type: String,
        required: true
    },

    transmission: {
        type: String,
        required: true
    },

    fuel: {
        type: String,
        required: true
    },

    engineSize: {
        type: String,
        required: true
    },

    vehicleSize: {
        type: String,
        required: true
    },

    vehicleBrand: {
        type: mongoose.Types.ObjectId,
        ref: "VehicleBrand",
        required: true
    },
}, { timestamps: true }))