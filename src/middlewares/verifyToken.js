import jwt from "jsonwebtoken";
import { AdminModel } from "../models/Admin.model.js";

export const verifyAdminToken = async (req, res, next) => {
  console.log('Inside verify stuff')
  try {
    // Get the auth header
    console.log('Inside try catch')
    const authHeader = req.headers.auth_token;
    console.log('After auth header')
    console.log('Auth token:', authHeader)
    const authHeaderPatch = req?.body?.headers?.auth_token ? req?.body?.headers?.auth_token : false;
    console.log('After auth header patch')
    const headers = req.headers;

    // if the token key exists in the request header
    if (authHeader) {
      // Get the token
      // Using split because the header value is expected to be in the format below
      // token: Bearer xxxxx
      const token = authHeader.split(" ")[1]
      console.log("TOKEN AUTH HEADER:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET, null);

      // Check db for valid admin
      // const admin = await AdminModel.findById(decoded._id)
      // if(!admin) return res.status()

      req.admin = decoded;
      next();
    } else if (authHeaderPatch) {
      // Get the token
      // Using split because the header value is expected to be in the format below
      // token: Bearer xxxxx
      const token = authHeaderPatch.split(" ")[1];
      console.log("TOKEN AUTH HEADER PATCH:", token);

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
      console.log("token:", token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET, null);
      console.log("decoded token:", decoded);

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
