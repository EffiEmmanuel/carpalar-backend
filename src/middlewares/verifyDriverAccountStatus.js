import { DriverModel } from "../models/Driver.model.js";

const verifyDriverAccountStatus = async (req, res, next) => {
  try {
    const { driverId } = req.query;

    // Check if the driver exists
    let driver = await DriverModel.findById(driverId);
    if (!driver)
      return res
        .status(404)
        .json({ message: "Account does not exist! Please sign up" });

    // Check if the driver's account has been approved
    if (!driver.isAccountApproved)
      return res.status(400).json({
        message:
          "Your account needs to be approved to perform this action.",
      });

    // If the account has been approved
    next();
  } catch (error) {
    return res
      .status(500)
      .json({
        message:
          "An error occured while processing your request. Please try again.",
      });
  }
};

export default verifyDriverAccountStatus;
