import jwt from "jsonwebtoken";
import { AdminModel } from "../models/Admin.model.js";

export const verifyAdminToken = async (req, res, next) => {
  try {
    // Get the auth header
    const authHeader = req.headers.authToken;
    // if the token key exists in the request header
    if (authHeader) {
      // Get the token
      // Using split because the header value is expected to be in the format below
      // token: Bearer xxxxx
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET, null);

      // Check db for valid admin 
      // const admin = await AdminModel.findById(decoded._id)
      // if(!admin) return res.status()

      req.admin = decoded;
      next();
    } else {
      return res.status(401).json({ message: "Token required!" });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ message: "Authentication failed!", error });
  }
};

export const verifyDriverToken = async (req, res, next) => {
  try {
    // Get the auth header
    const authHeader = req.headers.token;
    // if the token key exists in the request header
    if (authHeader) {
      // Get the token
      // Using split because the header value is expected to be in the format below
      // token: Bearer xxxxx
      const token = authHeader.split(" ")[1];
      console.log('token:', token)
      const decoded = jwt.verify(token, process.env.JWT_SECRET, null);
      console.log('decoded token:', decoded)

      // Check db for valid Driver
      // const driver = await DriverModel.findById(decoded._id)
      // if(!driver) return res.status()

      req.driver = decoded;
      next();
    } else {
      return res.status(401).json({ message: "Token required!" });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ message: "Authentication failed!", error });
  }
};