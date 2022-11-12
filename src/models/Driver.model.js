import mongoose from "mongoose";

export const DriverModel = new mongoose.model(
  "Driver",
  mongoose.Schema(
    {
      firstname: {
        type: String,
        required: true,
      },

      othername: {
        type: String,
        required: true,
      },

      surname: {
        type: String,
        required: true,
      },

      gender: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      otherPhone: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      password: {
        type: String,
        required: true,
      },

      dateOfBirth: {
        type: Date,
        required: true,
      },

      placeOfBirth: {
        type: String,
        required: true,
      },

      maritalStatus: {
        type: String,
        required: true,
      },

      occupation: {
        type: String,
        required: true,
      },

      yearsOfDrivingExperience: {
        type: Number,
        required: true,
      },

      nationality: {
        type: String,
        required: true,
      },

      highestAcademicQualification: {
        type: String,
        required: true,
      },

      stateOfOrigin: {
        type: String,
        required: true,
      },

      lga: {
        type: String,
        required: true,
      },

      driversLicense: {
        type: String,
        required: true,
      },

      licenseNumber: {
        type: String,
        required: true,
      },

      driversLicenseCloudinaryId: {
        type: String,
        required: true,
      },

      otherHailingPlatforms: {
        type: String,
        required: true,
      },

      // Not required fields
      // They'll fill these informations after their account is approved
      proofOfAddress: {
        type: String,
        // required: true
      },

      vehicle: {
        type: mongoose.Types.ObjectId,
        ref: "Vehicle",
      },

      guarantor: [
        {
          type: mongoose.Types.ObjectId,
          ref: "Guarantor",
        },
      ],

      comfortableContractDuration: {
        type: String,
      },

      paymentInterval: {
        type: String,
      },

      totalAmountPaid: {
        type: String,
      },

      amountLeftToBePaid: {
        type: String,
      },

      amountToBePaidMonthly: {
        type: String,
      },

      downpaymentBudget: {
        type: String,
      },

      otherPaymentAmount: {
        type: String,
      },

      isAccountApproved: {
        type: Boolean,
        default: false,
      },

      isApplicationComplete: {
        type: Boolean,
        default: false,
      },

      isRegistrationFeePaid: {
        type: Boolean,
        default: false
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
        default: true,
      },
    },
    { timestamps: true }
  )
);
