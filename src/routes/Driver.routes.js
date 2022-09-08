import express from 'express'
import { routes } from '../../routes.js'
import { registerDriver, loginDriver, verifyDriverLogin } from '../controllers/Driver.controller.js'
import verifyDriverAccountStatus from '../middlewares/verifyDriverAccountStatus.js'

const router = express.Router()

//  CATEGORY: DRIVER
// REGISTER
router.post(routes.driverRegister, registerDriver)
// LOGIN
router.post(routes.driverLogin, loginDriver)
// VERIFY OTP THEN SIGN JWT - STILL UNDER LOGIN
router.post(routes.verifyDriverLogin, verifyDriverLogin)

// SUBMIT REMAINING DOCUMENTS
// router.patch(routes.driverCompleteRegistration, verifyDriverAccountStatus, )
// MAKE PAYMENTS


const driverRouter = router
export default driverRouter