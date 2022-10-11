import mongoose from "mongoose";

export const GuarantorModel = new mongoose.model(
  "Guarantor",
  mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },

      relationship: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },
      
      jobTitle: {
        type: String,
        required: true
      },

      bvn: {
        type: String,
        required: true,
      },

      nin: {
        type: String,
        required: true,
      },

      driver: {
        type: mongoose.Types.ObjectId,
        ref: "Driver",
        required: true
      }
    },
    { timestamps: true }
  )
);
