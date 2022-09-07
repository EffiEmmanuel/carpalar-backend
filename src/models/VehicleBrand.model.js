import mongoose from "mongoose";

export const VehicleBrandModel = new mongoose.model(
  "VehicleBrand",
  mongoose.Schema(
    {
      brandName: {
        type: String,
        required: true,
      },

      image: {
        type: String,
        required: true,
      },

      cloudinaryId: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  )
);
