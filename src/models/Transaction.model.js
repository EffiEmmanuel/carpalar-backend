import mongoose from "mongoose";

export const TransactionModel = new mongoose.model(
  "Transaction",
  new mongoose.Schema(
    {
      transactionId: {
        type: String,
        required: true,
      },
      
      amount: {
        type: String,
        required: true,
      },

      channel: {
        type: String,
        required: true,
      },

      currency: {
        type: String,
        required: true,
      },

      ipAddress: {
        type: String,
        required: true,
      },

      reference: {
        type: String,
        required: true,
      },

      driver: {
        type: mongoose.Types.ObjectId,
        ref: "Driver",
      },

      status: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
    { timestamps: true }
  )
);
