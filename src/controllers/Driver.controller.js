import { DriverModel } from "../models/Driver.model.js";
import { OTPModel } from "../models/OTP.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.js";
import { jwtSign } from "../helpers/auth.js";
import { sendOTP } from "../helpers/twilio.js";

// Register Driver
export const registerDriver = async (req, res) => {
  const { firstname, lastname, email, phone, password } = req.body;

  // Check for missing fields
  if (!firstname || !lastname || !email || !phone || !password) {
    return res
      .status(401)
      .json({ message: "Please fill out the missing fields." });
  }

  try {
    // Check if driver account already exists
    let driverExists = await DriverModel.findOne({ email });
    if (driverExists)
      return res
        .status(401)
        .json({ message: "This account exists! Please try logging in." });

    // Creating a new driver and saving to the DB
    let newDriver = new DriverModel({
      firstname,
      lastname,
      email,
      phone,
      password: hashPassword(password),
    });
    await newDriver.save();

    res
      .status(201)
      .json({ message: "Your account has been created successfully!" });
  } catch (error) {
    return res.status(401).json({
      message:
        "An error occured while processing your request. Please try again.",
    });
  }
};

// Login Driver
export const loginDriver = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(401)
      .json({ message: "Please fill out the missing fields." });

  try {
    // Check if an account exists with the provided email
    let driverExists = await DriverModel.findOne({ email });
    if (!driverExists)
      return res
        .status(404)
        .json({ message: "Account does not exist! Please sign up" });

    // Check if the password is correct
    const passwordMatches = comparePassword(password, driverExists.password);
    if (!passwordMatches)
      return res.status(401).json({ message: "Invalid email or password" });

    // Send SMS verification here before proceeding to log in the user
    const OTP = sendOTP(driverExists.phone);

    const newOTP = new OTPModel({
      code: OTP,
      driverId: driverExists._id,
    });

    // Saving the new OTP to the DB
    await newOTP.save()

    return res.status(200).json({
      message: "An OTP has been sent to your registered phone number.",
      driverId: driverExists._id,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "An error occured while processing your request. Please try again.",
      error,
    });
  }
};


// Handles OTP verification and jwt signing
export const verifyDriverLogin = async (req, res) => {
  const { otp } = req.body;
  const { driverId } = req.query;

  if (!otp || !driverId)
    return res
      .status(401)
      .json({ message: "An error occured. Driver id not seen!" });

  try {
    let driver = await DriverModel.findById(driverId);
    if (!driver)
      return res
        .status(401)
        .json({ message: "Bad request. Driver does not exist!" });

    // Check if the OTP is correct
    let isOTPCorrect = await OTPModel.findOne({ code: otp, driverId });
    console.log('OTP:', isOTPCorrect)
    if (!isOTPCorrect)
      return res
        .status(404)
        .json({ message: "OTP has expired. Please request a new one" });

    // If both the driver exists and the OTP corresponds
    // Generate a token and send it to the frontend

    // Payload to sign
    const payload = {
      _id: driver._id,
      firstname: driver.firstname,
      lastname: driver.lastname,
      email: driver.email,
      phone: driver.phone,
      isAccountApproved: driver.isAccountApproved,
      isEmailVerified: driver.isEmailVerified,
      isPhoneVerified: driver.isPhoneVerified,
      isAccountBlocked: driver.isAccountBlocked,
    };

    // Sign the payload
    let userToken;
    await jwtSign(payload).then((token) => (userToken = token));

    return res.status(200).json({ message: "Login successful", userToken });
  } catch (error) {
    return res
      .status(500)
      .json({
        message:
          "An Error occured while processing your request. Please try again.",
        error,
      });
  }
};
