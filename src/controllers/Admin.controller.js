import { AdminModel } from "../models/Admin.model.js";
import { VehicleModel } from "../models/Vehicle.model.js";
import { VehicleBrandModel } from "../models/VehicleBrand.model.js";
import { DriverModel } from "../models/Driver.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.js";
import { jwtSign } from "../helpers/auth.js";
import { uploadToCloudinary } from "../helpers/cloudinaryUploader.js";
import sendEmail from "../helpers/sendgrid.js";
import { TransactionModel } from "../models/Transaction.model.js";
import * as p from "paystack";
const paystack = p.default(`${process.env.PAYSTACK_SECRET_KEY}`);

// CREATE admin
export const createAdmin = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res
      .status(401)
      .json({ message: "Please fill out the missing fields" });
  }

  try {
    let admin = await AdminModel.findOne({ email });
    if (admin)
      return res
        .status(400)
        .json({ message: "This admin already exists! Please log in." });

    // hash passeord
    const hashedPassword = hashPassword(password);

    // Create new admin
    admin = new AdminModel({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    await admin.save();

    return res
      .status(201)
      .json({ message: "Admin created successfuully", data: admin });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again" });
  }
};

// LOG IN admin
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(401)
      .json({ message: "Please fill out the missing fields" });
  }

  try {
    // Check if an account exists with the email provided
    let admin = await AdminModel.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Account does not exist!." });

    // compare password
    const isPasswordCorrect = comparePassword(password, admin.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid email or password." });

    // Payload to sign
    const payload = {
      _id: admin._id,
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
    };

    // Sign a new JWT token
    let adminToken;
    await jwtSign(payload).then((token) => {
      adminToken = token;
    });

    // Return token
    return res
      .status(201)
      .json({ message: "Admin logged in successfuully", adminToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again" });
  }
};

// GET STATS
export const adminGetStats = async (req, res) => {
  try {
    const drivers = await getNumberOfDrivers();
    const approvedDrivers = await getNumberOfApprovedDrivers();
    const vehicles = await getNumberOfVehicles();
    const vehicleBrands = await getNumberOfVehicleBrands();

    return res.status(200).json({
      message: "Statistics fetched",
      stats: {
        drivers,
        approvedDrivers,
        vehicles,
        vehicleBrands,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again." });
  }
};

// GET STATS
export const adminGetPendingApplications = async (req, res) => {
  try {
    const pendingApplications = await DriverModel.find({
      isAccountApproved: false,
      isAccountBlocked: true,
    });
    console.log("PA:", pendingApplications);
    return res
      .status(200)
      .json({ message: "Pending applications fetched", pendingApplications });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again." });
  }
};

// GET NUMBER OF DRIVERS
const getNumberOfDrivers = async () => {
  try {
    const numberOfDrivers = await DriverModel.find().count();
    return numberOfDrivers;
  } catch (error) {
    console.log("An error occured:", error);
    return error;
  }
};

// GET NUMBER OF APPROVED DRIVERS
const getNumberOfApprovedDrivers = async () => {
  try {
    const numberOfApprovedDrivers = await DriverModel.find({
      isAccountApproved: true,
    }).count();
    return numberOfApprovedDrivers;
  } catch (error) {
    console.log("An error occured:", error);
    return error;
  }
};

// UPDATE driver
export const adminUpdateDriver = async (req, res) => {
  const driverId = req.query.driverId;
  try {
    const driver = await DriverModel.findByIdAndUpdate(driverId, req.body);
    return res.status(201).json({
      message: "Driver details have been updated successfully",
      driver,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Sorry, an error occured while we procesed your request. Please try again",
    });
  }
};

// DELETE driver
export const adminDeleteDriver = async (req, res) => {
  const driverId = req.query.driverId;
  try {
    const driver = await DriverModel.findByIdAndRemove(driverId);
    return res.status(201).json({ message: "Delete successful", driver });
  } catch (error) {
    return res.status(500).json({
      message:
        "Sorry, an error occured while we procesed your request. Please try again",
    });
  }
};

// GET NUMBER OF VEHICLES
const getNumberOfVehicles = async () => {
  try {
    const numberOfVehicles = await VehicleModel.find().count();
    return numberOfVehicles;
  } catch (error) {
    console.log("An error occured:", error);
    return error;
  }
};

// GET NUMBER OF VEHICLE BRANDS
const getNumberOfVehicleBrands = async () => {
  try {
    const numberOfVehicleBrands = await VehicleBrandModel.find().count();
    return numberOfVehicleBrands;
  } catch (error) {
    console.log("An error occured:", error);
    return error;
  }
};

// CATEGORY:VEHICLES
// CREATE vehicle
export const createVehicle = async (req, res) => {
  console.log("Hello");
  console.log("REQ.BODY:", req.body);
  const {
    name,
    yearOfProduction,
    transmission,
    fuel,
    engineSize,
    vehicleSize,
    vehicleBrand,
    price,
  } = req.body;

  if (
    !name ||
    !yearOfProduction ||
    !transmission ||
    !fuel ||
    !engineSize ||
    !vehicleSize ||
    !vehicleBrand ||
    !price
  ) {
    return res.status(401).json({
      message: "Please fill out the missing fields",
    });
  }

  try {
    let vehicle = await VehicleModel.findOne({ name });

    if (vehicle) {
      return res.status(401).json({ message: "This car already exists." });
    }

    vehicle = new VehicleModel({
      name,
      yearOfProduction,
      transmission,
      fuel,
      engineSize,
      vehicleSize,
      vehicleBrand,
      price,
    });

    await vehicle.save();

    return res.status(201).json({
      message: "Vehicle has been successfully created!",
      data: vehicle,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again." });
  }
};

// UPDATE vehicle by id
export const updateVehicleById = async (req, res) => {
  const vehicleId = req.params.vid;
  if (!vehicleId)
    return res.status(401).json({
      message: "Request could not be completed. No id provided!",
      vehicles,
    });

  try {
    const vehicle = await VehicleModel.findByIdAndUpdate(vehicleId, req.body);
    return res.status(200).json({ message: "Vehicle successfully updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// DELETE vehicle by id
export const deleteVehicleById = async (req, res) => {
  const vehicleId = req.params.vid;
  if (!vehicleId)
    return res.status(401).json({
      message: "Request could not be completed. No id provided!",
      vehicles,
    });

  try {
    const vehicle = await VehicleModel.findByIdAndRemove(vehicleId);
    return res
      .status(200)
      .json({ message: "Vehicle successfully deleted", vehicle });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// CATEGORY: DRIVERS
// GET all drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await DriverModel.find();
    return res.status(200).json({ message: "Fetched all drivers", drivers });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// APPROVE driver by id
export const approveDriverById = async (req, res) => {
  const driverId = req.params.did;
  const email = req.query.email;

  console.log("driver id:", driverId);
  console.log("email:", email);
  if (!driverId)
    return res
      .status(401)
      .json({ message: "Request could not be completed. No id provided!" });
  try {
    const driver = await DriverModel.findByIdAndUpdate(driverId);

    if (!driver) {
      return res.status(401).json({ message: "Driver does not exist!" });
    }

    driver.isAccountApproved = true;
    await driver.save();

    // TO-DO: SEND AN EMAIL TO THE DRIVER
    sendAccountApprovedEmail(email);
    return res.status(200).json({ message: "Driver successfully approved" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// BLOCK driver by id
export const blockDriverById = async (req, res) => {
  const driverId = req.params.did;
  const email = req.query.email;
  if (!driverId)
    return res
      .status(401)
      .json({ message: "Request could not be completed. No id provided!" });
  try {
    const driver = await DriverModel.findByIdAndUpdate(driverId, {
      isAccountBlocked: true,
    });

    // TO-DO: SEND AN EMAIL TO THE DRIVER
    sendAccountBlockedEmail(email);
    return res.status(200).json({ message: "Driver successfully blocked" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

const sendAccountApprovedEmail = async (email) => {
  console.log("inside send account approval email function");
  const subject = "Congratulations!🎉";
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
        <h2 style="margin:30px 0;font-weight:bold;font-size:2.3rem"><strong>Guess whose account has been approved!</strong></h2>
        <p style="margin:30px 0;font-size:1.3rem">We are so excited to have you on board!<br />You can now log in to your account to complete your registration. Thank you!</p>
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

const sendAccountBlockedEmail = async (email) => {
  console.log("inside send account denied email function");
  const subject = "Your application to drive with Carpalar";
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
        <h2 style="margin:30px 0;font-weight:bold;font-size:2.3rem"><strong>We're sorry</strong></h2>
        <p style="margin:30px 0;font-size:1.3rem">After much consideration, we have decided to not proceed with your application at this point in time. If you feel this is a mistake, please reach out to our support team immediately.</p>
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

// VEHICLE BRANDS
// CREATE vehicle brand
export const createVehicleBrand = async (req, res) => {
  const { brandName } = req.body;
  const image = req.file;

  if (!brandName || !image) {
    return res.status(401).json({
      message: "Please fill out the missing fields",
    });
  }

  try {
    let vehicleBrand = await VehicleBrandModel.findOne({ brandName });

    if (vehicleBrand) {
      return res.status(401).json({ message: "This car already exists." });
    }

    // Upload to cloudinary
    const result = await uploadToCloudinary(req.file.path);

    vehicleBrand = new VehicleBrandModel({
      brandName,
      image: result.secure_url,
      cloudinaryId: result.public_id,
    });

    await vehicleBrand.save();

    return res.status(201).json({
      message: "Vehicle has been successfully created!",
      data: vehicleBrand,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// UPDATE vehicle brand by id
export const updateVehicleBrandById = async (req, res) => {
  const vehicleBrandId = req.params.vbid;
  if (!vehicleBrandId)
    return res
      .status(401)
      .json({ message: "Request could not be completed. No id provided!" });

  try {
    const vehicleBrand = await VehicleBrandModel.findByIdAndUpdate(
      vehicleBrandId,
      req.body
    );
    return res
      .status(200)
      .json({ message: "Vehicle brand successfully updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// DELETE vehicle brand by id
export const deleteVehicleBrandById = async (req, res) => {
  const vehicleBrandId = req.params.vbid;
  if (!vehicleBrandId)
    return res
      .status(401)
      .json({ message: "Request could not be completed. No id provided!" });

  try {
    const vehicleBrand = await VehicleBrandModel.findByIdAndRemove(
      vehicleBrandId
    );
    return res
      .status(200)
      .json({ message: "Vehicle brand successfully deleted", vehicleBrand });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// TRANSACTIONS
// CREATE TRANSACTION
export const adminCreateTransaction = async (req, res) => {
  const {
    transactionId,
    amount,
    channel,
    currency,
    ipAddress,
    reference,
    driver,
    status,
  } = req.body;

  if (
    !transactionId ||
    !amount ||
    !channel ||
    !currency ||
    !ipAddress ||
    !reference ||
    !driver ||
    !status
  ) {
    return res
      .status(401)
      .json({ message: "Please fill out the missing fields" });
  }

  try {
    const transaction = await TransactionModel.find({ transactionId });

    if (transaction) {
      return res.status(400).json({
        message: "Transaction reference already exists!",
        transaction,
      });
    }

    transaction = new TransactionModel({
      transactionId,
      amount,
      channel,
      currency,
      ipAddress,
      reference,
      driver,
      status
    })

    await transaction.save()

    return res.status(201).json({
      message: "Transaction created successfully!",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "An error occured while processing your request. Please try again.",
      error,
    });
  }
};
// GET ALL TRANSACTIONS
export const adminGetTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "All transactions fetched successfully!",
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "An error occured while processing your request. Please try again.",
      error,
    });
  }
};

// GET TRANSACTION BY ID
export const adminGetTransactionById = async (req, res) => {
  const _id = req.params._id;
  try {
    const transaction = await TransactionModel.find({ _id });

    if (!transaction) {
      return res.status(404).json({
        message:
          "Transaction does not exist! Please cross-check the transaction id and try again.",
      });
    }
    return res
      .status(200)
      .json({ message: "Transaction fetched successfully!", transaction });
  } catch (error) {
    return res.status(500).json({
      message:
        "An error occured while processing your request. Please try again.",
      error,
    });
  }
};

// VERIFY TRANSACTION BY REFERENCE ID
export const adminVerifyTransaction = async (req, res) => {
  const refId = req.params.refId;

  if (!refId) {
    return res.status(401).json({
      message: "Reference id required!",
    });
  }

  try {
    const verifySuccess = await paystack.transaction.verify(refId);
    console.log("VERIFYSUCCESS:", verifySuccess);
    return res.status(200).json({
      message: "Transaction successfully verified.",
      transactionDetails: verifySuccess.data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Transaction verification failed.",
    });
  }

  // await paystack.transaction.verify(refId).then((res) => {
  // return res.status(200).json({
  //   message: "Transaction successfully verified.",
  //   transactionDetails: res.data,
  // });
  // });
};
