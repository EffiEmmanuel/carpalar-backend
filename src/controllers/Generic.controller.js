import { VehicleModel } from "../models/Vehicle.model.js";
import { VehicleBrandModel } from "../models/VehicleBrand.model.js";

// CATEGORY: VEHICLES
// GET all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleModel.find();
    return res.status(200).json({ message: "Fetched all vehicles", vehicles });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// GET vehicle by id
export const getVehicleById = async (req, res) => {
  const vehicleId = req.params.vid;
  if (!vehicleId)
    return res.status(401).json({
      message: "Request could not be completed. No id provided!",
    });

  try {
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle)
      return res.status(404).json({ message: "Vehicle does not exist" });
    return res.status(200).json({ message: "Fetched vehicle", vehicle });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};


// CATEGORY: VEHICLE BRANDS
// GET all vehicle brands
export const getAllVehicleBrands = async (req, res) => {
  try {
    const vehicleBrands = await VehicleBrandModel.find();
    return res
      .status(200)
      .json({ message: "Fetched all vehicle brands", vehicleBrands });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};

// GET vehicle brand by id
export const getVehicleBrandById = async (req, res) => {
  const vehicleBrandId = req.params.vbid;
  if (!vehicleBrandId)
    return res
      .status(401)
      .json({ message: "Request could not be completed. No id provided!" });

  try {
    const vehicleBrand = await VehicleBrandModel.findById(vehicleBrandId);
    if (!vehicleBrand)
      return res.status(404).json({ message: "Vehicle brand does not exist" });
    return res
      .status(200)
      .json({ message: "Fetched vehicle brand", vehicleBrand });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occured. Please try again.", error });
  }
};
