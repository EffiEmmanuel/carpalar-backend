import express from "express";
import { routes } from "../../routes.js";
import {
  registerDriver,
  loginDriver,
  verifyDriverLogin,
  requestNewOTP,
  verifyDriverEmail,
  requestNewEmailOTP,
  verifyDriverPhone,
  requestNewEmailVerificationLink,
  updateDriver,
  completeRegistration,
} from "../controllers/Driver.controller.js";
import verifyDriverAccountStatus from "../middlewares/verifyDriverAccountStatus.js";
import { upload } from "../config/multer.config.js";
import { verifyDriverToken } from "../middlewares/verifyToken.js";

const router = express.Router();

//  CATEGORY: DRIVER
// REGISTER
router.post(
  routes.driverRegister,
  upload.single("drivers-license"),
  registerDriver
);
// LOGIN
router.post(routes.driverLogin, loginDriver);
// VERIFY OTP THEN SIGN JWT - STILL UNDER LOGIN
router.post(routes.verifyDriverLogin, verifyDriverLogin);
// RESEND SMS OTP
router.get(routes.driverResendOTP, requestNewOTP);
// RESEND EMAIL OTP
router.get(routes.driverResendEmailOTP, requestNewEmailOTP);
// VERIFY EMAIL
router.patch(routes.driverVerifyEmail, verifyDriverEmail);
// REQUEST NEW EMAIL VERIFICATION LINK
router.get(
  routes.driverRequestNewEmailVerificationLink,
  requestNewEmailVerificationLink
);
// VERIFY PHONE
router.patch(routes.driverVerifyPhone, verifyDriverPhone);

// SUBMIT REMAINING DOCUMENTS / UPDATE DRIVER
router.patch(
  routes.driverUpdate,
  verifyDriverAccountStatus,
  verifyDriverToken,
  updateDriver
);
router.patch(
  routes.driverCompleteRegistration,
  verifyDriverAccountStatus,
  completeRegistration
);
// MAKE PAYMENTS

const driverRouter = router;
export default driverRouter;
