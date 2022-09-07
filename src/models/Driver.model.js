import mongoose from "mongoose";

export const DriverModel = new mongoose.model(
  "Driver",
  mongoose.Schema(
    {
      firstname: {
        type: String,
        required: true,
      },

      lastname: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      password: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        // required: true
      },

      proofOfAddress: {
        type: String,
        // required: true
      },

      driversLicense: {
        type: String,
        // required: true
      },

      vehicle: {
        type: mongoose.Types.ObjectId,
        ref: "Vehicle",
      },

      isAccountVerified: {
        type: Boolean,
        default: false,
      },

      isEmailVerified: {
        type: Boolean,
        default: false,
      },

      isPhoneVerified: {
        type: Boolean,
        default: false,
      },

      isAccountBlocked: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  )
);
