import { AdminModel } from "../models/Admin.model.js";
import { VehicleModel } from "../models/Vehicle.model.js";
import { VehicleBrandModel } from "../models/VehicleBrand.model.js";
import { DriverModel } from "../models/Driver.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.js";
import { jwtSign } from "../helpers/auth.js";
import { uploadToCloudinary } from "../helpers/cloudinaryUploader.js";

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
      .json({ message: "Admin loggedIn successfuully", adminToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again" });
  }
};

// CATEGORY:VEHICLES
// CREATE vehicle
export const createVehicle = async (req, res) => {
  console.log("REQ.ADMIN:", req.admin);
  const {
    name,
    yearOfProduction,
    transmission,
    fuel,
    engineSize,
    vehicleSize,
    vehicleBrand,
  } = req.body;

  if (
    !name ||
    !yearOfProduction ||
    !transmission ||
    !fuel ||
    !engineSize ||
    !vehicleSize ||
    !vehicleBrand
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
    return res
      .status(401)
      .json({
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
    return res
      .status(401)
      .json({
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
  if (!driverId)
    return res
      .status(401)
      .json({ message: "Request could not be completed. No id provided!" });
  try {
    const driver = await DriverModel.findByIdAndUpdate(driverId, {
      isAccountVerified: true,
    });

    // TO-DO: SEND AN EMAIL TO THE DRIVER

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
  if (!driverId)
    return res
      .status(401)
      .json({ message: "Request could not be completed. No id provided!" });
  try {
    const driver = await DriverModel.findByIdAndUpdate(driverId, {
      isAccountBlocked: true,
    });

    // TO-DO: SEND AN EMAIL TO THE DRIVER

    return res.status(200).json({ message: "Driver successfully blocked" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
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
