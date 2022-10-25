import mongoose from "mongoose";

export const TransactionModel = new mongoose.model(
  "Transaction",
  new mongoose.Schema(
    {
      transactionId: {
        type: Number,
        required: true,
      },
      
      amount: {
        type: Number,
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

      reference: {
        type: String,
        required: true,
      },

      driver: {
        type: mongoose.Types.ObjectId,
        ref: "Driver",
      },

      status: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  )
);
