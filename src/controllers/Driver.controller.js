import { DriverModel } from "../models/Driver.model.js";
import { OTPModel } from "../models/OTP.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.js";
import { jwtSign } from "../helpers/auth.js";
import { sendOTP } from "../helpers/twilio.js";
import sendEmail from "../helpers/sendgrid.js";
import otpGenerator from "otp-generator";
import cloudinary from "../config/cloudinary.config.js";

import sendgridMail from "@sendgrid/mail";
import { GuarantorModel } from "../models/Guarantor.model.js";
// import
console.log("API KEY:", process.env.SENDGRID_API_KEY);
sendgridMail.setApiKey(
  "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"
);

const driverVerificationUrl = "http://localhost:3000/driver/verify-email";

// Register Driver
export const registerDriver = async (req, res) => {
  console.log("REQ.BODY:", req.body);
  console.log("REQ.FILE:", req.file);

  const {
    firstname,
    othername,
    surname,
    gender,
    address,
    phone,
    otherPhone,
    email,
    password,
    dateOfBirth,
    placeOfBirth,
    maritalStatus,
    occupation,
    yearsOfDrivingExperience,
    nationality,
    highestAcademicQualification,
    stateOfOrigin,
    lga,
    otherHailingPlatforms,
  } = req.body;

  const driversLicense = req.file;

  // console.log("REQ:", req);
  // console.log("REQ.FILE:", req.file);
  // console.log("DLICENE:", driversLicense.name);

  console.log("before emptiness check");
  // Check for missing fields
  if (
    !firstname ||
    !othername ||
    !surname ||
    !gender ||
    !address ||
    !phone ||
    !otherPhone ||
    !email ||
    !password ||
    !dateOfBirth ||
    !placeOfBirth ||
    !maritalStatus ||
    !occupation ||
    !yearsOfDrivingExperience ||
    !nationality ||
    !highestAcademicQualification ||
    !stateOfOrigin ||
    !lga ||
    !driversLicense ||
    !otherHailingPlatforms
  ) {
    return res
      .status(401)
      .json({ message: "Please fill out the missing fields." });
  }

  console.log("before trycatch");

  try {
    console.log("before existing driver check");
    // Check if driver account already exists
    let driverExists = await DriverModel.findOne({ email }).exec();
    if (driverExists)
      return res
        .status(401)
        .json({ message: "This account exists! Please try logging in." });

    console.log("after existing driver check");

    console.log("before cloudinary upload");
    // const result = await uploadToCloudinary(driversLicense.path);
    const result = await cloudinary.uploader.upload(driversLicense.path);
    console.log("after cloudinary upload");

    console.log("before creating new driver model");
    // Creating a new driver and saving to the DB
    let newDriver = new DriverModel({
      firstname,
      othername,
      surname,
      gender,
      address,
      phone,
      otherPhone,
      email,
      password,
      dateOfBirth,
      placeOfBirth,
      maritalStatus,
      occupation,
      yearsOfDrivingExperience,
      nationality,
      highestAcademicQualification,
      stateOfOrigin,
      lga,
      driversLicense: result.secure_url,
      driversLicenseCloudinaryId: result.public_id,
      otherHailingPlatforms,
      password: hashPassword(password),
    });

    console.log("after creation, now trying to save model");
    await newDriver.save();

    console.log("after creating and saving new driver model");

    // SEND OTP TO USERS PHONE
    const smsOtp = sendOTP(newDriver.phone);
    console.log("after sending SMS otp");

    // Save it to the DB
    const expiryTime = new Date().getTime();

    console.log("before creating and saving new driver model");
    const newOTP = new OTPModel({
      code: smsOtp,
      driverId: newDriver._id,
      expiresAt: expiryTime + 300000,
    });

    console.log("before saving new otp model");
    // Saving the new OTP to the B
    newOTP.save();
    console.log("after creating and saving new otp model");

    console.log("before sending verification email");
    sendEmailVerificationEmail(newDriver._id, newDriver.email, newOTP.code);

    res.status(201).json({
      message: "Your account has been created successfully!",
      driverId: newDriver._id,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "An error occured while processing your request. Please try again.",
      error,
    });
  }
};

export const completeRegistration = async (req, res) => {
  const { guarantorOne, guarantorTwo, vehicle, comfortableContractDuration, downpaymentBudget, otherPaymentAmount } = req.body
  const { driverId } = req.query

  console.log('COMPLETE REG REQ:', req.body)

  if (!guarantorOne || !guarantorTwo || !vehicle || !comfortableContractDuration || !downpaymentBudget) {
    return res.status(401).json({ message: 'Please fill out the missing fields' })
  }
  
  if(!driverId) {
    return res.status(401).json({ message: 'Invalid action! Driver id cannot be empty' })
  }

  try {
    console.log('INSIDE TRY-CATCH')
    let driver = await DriverModel.findById(driverId)
    console.log('AFTER FIND DRIVER')
    if(driver.isApplicationComplete) {
      return res.status(400).json({ message: 'Invalid action! This action cannot be performed more than once!' })
    }
    
    console.log('BEFORE DESTRUCTURING')
    let guarantor1 = new GuarantorModel({
      name: guarantorOne.name,
      relationship: guarantorOne.relationship,
      phone: guarantorOne.phone,
      email: guarantorOne.email,
      address: guarantorOne.address,
      jobTitle: guarantorOne.jobTitle,
      bvn: guarantorOne.bvn,
      nin: guarantorOne.nin,
      driver: guarantorOne.driverId
    })
    
    let guarantor2 = new GuarantorModel({
      name: guarantorTwo.name,
      relationship: guarantorTwo.relationship,
      phone: guarantorTwo.phone,
      email: guarantorTwo.email,
      address: guarantorTwo.address,
      jobTitle: guarantorTwo.jobTitle,
      bvn: guarantorTwo.bvn,
      nin: guarantorTwo.nin,
      driver: guarantorTwo.driverId
    })
    
    // Save to guarantor collections
    await guarantor1.save()
    await guarantor2.save()
    // Update driver collection
    setIsApplicationComplete(driverId)
    
    return res.status(201).json({ message: 'Your registration has been completed successfully!' })

  } catch (error) {
    res.status(500).json({ message: 'An error occured while processing your request. Please try again.', error })
  }

}

const sendEmailVerificationEmail = async (driverId, email, otp) => {
  console.log("inside send verification email function");
  const subject = "Thanks for signing up on Carpalar!🎉";
  const html = `
  <!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <!-- CSS only -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT" crossorigin="anonymous" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

    * {
      font-family: 'Poppins';
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  </style>
</head>

<body style="height:100%;width:100%;box-sizing:border-box;margin:0;padding:0;display:flex;flex-direction:column;justify-content:center;align-items:center">
  <table style="width:100%;border-collapse: seperate;border-spacing:0 15px;font-family=Poppins">
    <tr>
      <td style="text-align:center"><a><img style="max-width:28%;margin:30px 0;" src='https://i.postimg.cc/pdLxmbRP/carpalar-png-trimmy.png' border='0' alt='Carpalar Logo' class="logo" /></a></td>
    </tr>

    <tr style="width:100%;text-align:center">
      <td>
        <h2 style="margin:30px 0;font-weight:bold;font-size:2.3rem"><strong>Welcome to Carparlar🎉</strong></h2>
        <p style="margin:30px 0;font-size:1.3rem">We are so excited to have you on board!<br />Please follow the link below to verify your email. Thank you!</p>
      </td>
    </tr>

    <tr style="width: 100%;text-align:center">
      <td>
        <a href="${driverVerificationUrl}?driverId=${String(
    driverId
  )}&code=${otp}" role="button" style="margin:15px 0;color:#fff;text-decoration:none;padding:15px 30px;border-radius:10px;background-color:#4169e1;border:none;display:inline-block">Verify email</a>
      </td>
    </tr>

    <tr style="margin-top:10px;color:#fff;width:100%;text-align:center">
      <td>
        <small style="background-color:#4169e1;color:#fff;padding:15px 0;display:block;text-align:center;width:100%;margin:100px 0 0;">Copyright&copy; Carpalar 2022 </small>
      </td>
    </tr>
  </table>

  </div>
  </div>
</body>

</html>
    `;

  console.log("Attempting to send email");
  await sendEmail(email, subject, html);
};

export const requestNewEmailVerificationLink = async (req, res) => {
  const { driverId } = req.query;

  // Check if driver account already exists
  let driverExists = await DriverModel.findById(driverId).exec();
  if (!driverExists)
    return res
      .status(401)
      .json({ message: "Invalid action! This account does not exist." });

  const OTP = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const expiryTime = new Date().getTime();

  console.log("before creating and saving new otp model");
  const newOTP = new OTPModel({
    code: OTP,
    driverId,
    expiresAt: expiryTime + 300000,
  });

  console.log("before saving new otp model");
  // Saving the new OTP to the B
  newOTP.save();
  console.log("after creating and saving new otp model");

  console.log("before sending verification email");
  resendEmailVerificationEmail(
    driverExists._id,
    driverExists.email,
    newOTP.code
  );

  return res.status(201).json({
    message: "A new verification link has been sent to your registered email.",
  });
};

const resendEmailVerificationEmail = async (driverId, email, otp) => {
  console.log("inside send verification email function");
  const subject = "Your request for a new email verification link";
  const html = `
  <!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <!-- CSS only -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-iYQeCzEYFbKjA/T2uDLTpkwGzCiq6soy8tYaI1GyVh/UjpbCx/TYkiZhlZB6+fzT" crossorigin="anonymous" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

    * {
      font-family: 'Poppins';
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  </style>
</head>

<body style="height:100%;width:100%;box-sizing:border-box;margin:0;padding:0;display:flex;flex-direction:column;justify-content:center;align-items:center">
  <table style="width:100%;border-collapse: seperate;border-spacing:0 15px;font-family=Poppins">
    <tr>
      <td style="text-align:center"><a><img style="max-width:28%;margin:30px 0;" src='https://i.postimg.cc/pdLxmbRP/carpalar-png-trimmy.png' border='0' alt='Carpalar Logo' class="logo" /></a></td>
    </tr>

    <tr style="width:100%;text-align:center">
      <td>
        <h2 style="margin:30px 0;font-weight:bold;font-size:2.3rem"><strong>A request was made from your account for a new email verification link</strong></h2>
        <p style="margin:30px 0;font-size:1.3rem">Please follow the link below to verify your email. Thank you!</p>
        <small style="margin:30px 0;font-size:1.3rem">Did not request?. Please contact support immediately.</small>
      </td>
    </tr>

    <tr style="width: 100%;text-align:center">
      <td>
        <a href="${driverVerificationUrl}?driverId=${String(
    driverId
  )}&code=${otp}" role="button" style="margin:15px 0;color:#fff;text-decoration:none;padding:15px 30px;border-radius:10px;background-color:#4169e1;border:none;display:inline-block">Verify email</a>
      </td>
    </tr>

    <tr style="margin-top:10px;color:#fff;width:100%;text-align:center">
      <td>
        <small style="background-color:#4169e1;color:#fff;padding:15px 0;display:block;text-align:center;width:100%;margin:100px 0 0;">Copyright&copy; Carpalar 2022 </small>
      </td>
    </tr>
  </table>

  </div>
  </div>
</body>

</html>
    `;

  console.log("Attempting to send email");
  await sendEmail(email, subject, html);
};

// VERIFY DRIVER PHONE
export const verifyDriverPhone = async (req, res) => {
  const { verificationCode } = req.body;
  const { driverId } = req.query;

  console.log("DRIVER", driverId);

  if (!verificationCode) {
    return res.status(401).json({ message: "Please provide a code." });
  }

  try {
    // Check if an account exists with the provided email
    let driverExists = await DriverModel.findById(driverId);
    if (!driverExists)
      return res
        .status(404)
        .json({ message: "Account does not exist! Please sign up" });

    // Check if Email OTP is valid
    const isOTPCorrect = await OTPModel.findOne({
      verificationCode,
      driverId,
    }).sort({
      createdAt: -1,
    });
    if (!isOTPCorrect)
      return res.status(404).json({ message: "Invalid OTP provided!" });

    // Check if OTP has expired
    if (isOTPCorrect.expiresAt < Date.now())
      return res.status(401).json({
        message: "Your OTP has expired. Please request for a new one.",
      });

    driverExists.isPhoneVerified = true;
    await driverExists.save();

    return res
      .status(201)
      .json({ message: "Your phone number has been successfully verified." });
  } catch (error) {
    return res.status(500).json({
      message:
        "An error occured while processing your request. Please try again.",
    });
  }
};

// VERIFY DRIVER EMAIL
export const verifyDriverEmail = async (req, res) => {
  const { code, driverId } = req.query;

  console.log("code:", code);
  console.log("id:", driverId);

  console.log("REQ.QUERY", req.query);

  try {
    // Check if an account exists with the provided email
    let driverExists = await DriverModel.findById(driverId);
    if (!driverExists)
      return res
        .status(404)
        .json({ message: "Account does not exist! Please sign up" });

    // Check if Email OTP is valid
    const isOTPCorrect = await OTPModel.findOne({ code, driverId }).sort({
      createdAt: -1,
    });
    if (!isOTPCorrect)
      return res.status(404).json({ message: "Invalid OTP provided!" });

    // Check if OTP has expired
    if (isOTPCorrect.expiresAt < Date.now())
      return res.status(401).json({
        message: "Your OTP has expired. Please request for a new one.",
      });

    driverExists.isEmailVerified = true;
    await driverExists.save();

    return res
      .status(201)
      .json({ message: "Your email has been successfully verified." });
  } catch (error) {
    return res.status(500).json({
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

    const expiryTime = new Date().getTime();

    const newOTP = new OTPModel({
      code: OTP,
      driverId: driverExists._id,
      mode: "sms",
      expiresAt: expiryTime + 300000,
    });

    // Saving the new OTP to the B
    newOTP.save();

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
  const { verificationCode } = req.body;
  const { driverId } = req.query;

  console.log("verificationCode:", verificationCode);
  console.log("DRIVERID:", driverId);

  if (!verificationCode || !driverId)
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
    let isOTPCorrect = await OTPModel.findOne({
      code: verificationCode,
      driverId,
    }).sort({
      createdAt: -1,
    });
    console.log("OTP:", isOTPCorrect);
    if (!isOTPCorrect)
      return res.status(404).json({
        message: "Wrong OTP provided! Please cross-check and try again.",
      });

    // Checking if the OTP has expired
    if (isOTPCorrect.expiresAt < Date.now())
      return res.status(401).json({
        message: "Your OTP has expired. Please request for a new one.",
      });

    // If both the driver exists, the OTP corresponds and has not expired
    // Generate a token and send it to the frontend

    // Payload to sign
    const payload = {
      _id: driver._id,
      firstname: driver.firstname,
      othername: driver.othername,
      surname: driver.surname,
      gender: driver.gender,
      address: driver.address,
      phone: driver.phone,
      otherPhone: driver.otherPhone,
      email: driver.email,
      dateOfBirth: driver.dateOfBirth,
      placeOfBirth: driver.placeOfBirth,
      maritalStatus: driver.maritalStatus,
      occupation: driver.occupation,
      yearsOfDrivingExperience: driver.yearsOfDrivingExperience,
      nationality: driver.nationality,
      highestAcademicQualification: driver.highestAcademicQualification,
      stateOfOrigin: driver.stateOfOrigin,
      lga: driver.lga,
      driversLicense: driver.driversLicense,
      driversLicenseCloudinaryId: driver.driversLicenseCloudinaryId,
      otherHailingPlatforms: driver.otherHailingPlatforms,
      isAccountApproved: driver.isAccountApproved,
      isEmailVerified: driver.isEmailVerified,
      isPhoneVerified: driver.isPhoneVerified,
      isAccountBlocked: driver.isAccountBlocked,
    };

    // Sign the payload
    let driverToken;
    await jwtSign(payload).then((token) => (driverToken = token));

    return res.status(200).json({ message: "Login successful", driverToken });
  } catch (error) {
    return res.status(500).json({
      message:
        "An Error occured while processing your request. Please try again.",
      error,
    });
  }
};

// REQUEST NEW SMS OTP
export const requestNewOTP = async (req, res) => {
  const { driverId } = req.query;
  console.log("ID:", driverId);
  console.log("Before try/catch");
  try {
    // Check if the driver exists
    console.log("check if driver exists");
    let driver = await DriverModel.findById({ _id: driverId });
    if (!driver)
      return res
        .status(401)
        .json({ message: "Bad request. Driver does not exist!" });

    console.log("before sending otp");

    // if driver exists, Send OTP
    // Send SMS verification here before proceeding to log in the user
    const OTP = sendOTP(driver.phone);
    console.log("after sending otp");

    const expiryTime = new Date().getTime();

    console.log("before creating new otp model");
    const newOTP = new OTPModel({
      code: OTP,
      driverId: driver._id,
      expiresAt: expiryTime + 300000,
    });
    console.log("after creating new otp model");

    console.log("before saving new otp model");
    // Saving the new OTP to the DB
    await newOTP.save();
    console.log("after creating new otp model");

    return res.status(201).json({
      message: "A new OTP has been sent to your registered phone number.",
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "An Error occured while processing your request. Please try again.",
      error,
    });
  }
};

// REQUEST NEW EMAIL OTP
export const requestNewEmailOTP = async (req, res) => {
  const { driverId } = req.query;
  try {
    // Check if the driver exists
    let driver = await DriverModel.findById(driverId);
    if (!driver)
      return res
        .status(401)
        .json({ message: "Bad request. Driver does not exist!" });

    // if driver exists
    // Generate new email OTP
    const OTP = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const expiryTime = new Date().getTime();

    const newOTP = new OTPModel({
      code: OTP,
      driverId: driver._id,
      mode: "email",
      expiresAt: expiryTime + 300000,
    });

    // Saving the new OTP to the DB
    await newOTP.save();

    sendEmailVerificationEmail(driver.email, OTP);

    return res.status(201).json({
      message: "A new OTP has been sent to your registered email address.",
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "An Error occured while processing your request. Please try again.",
      error,
    });
  }
};

// UPDATE DRIVER DETAILS
export const updateDriver = async (req, res) => {
  const driverId = req.query.driverId;
  try {
    const driver = await DriverModel.findByIdAndUpdate(driverId, req.body);
    return res
      .status(201)
      .json({ message: "Your details have been updated successfully", driver });
  } catch (error) {
    return res.status(500).json({
      message:
        "Sorry, an error occured while we procesed your request. Please try again",
    });
  }
};

// UPDATE DRIVER DETAILS
export const setIsApplicationComplete = async (driverId) => {
  try {
    const driver = await DriverModel.findByIdAndUpdate(driverId, { isApplicationComplete: true });
    return res
      .status(201)
      .json({ message: "Your details have been updated successfully", driver });
  } catch (error) {
    return res.status(500).json({
      message:
        "Sorry, an error occured while we procesed your request. Please try again",
    });
  }
};
