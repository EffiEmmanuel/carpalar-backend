import express from 'express'
import { routes } from '../../routes.js'
import { adminGetPendingApplications, adminUpdateDriver, adminGetStats, adminLogin, approveDriverById, blockDriverById, createAdmin, createVehicle, createVehicleBrand, deleteVehicleBrandById, deleteVehicleById, getAllDrivers, updateVehicleBrandById, updateVehicleById, adminDeleteDriver, adminGetTransactions, adminGetTransactionById, adminVerifyTransaction, adminCreateTransaction } from '../controllers/Admin.controller.js'
import { upload } from '../config/multer.config.js'
import { verifyAdminToken } from '../middlewares/verifyToken.js'
import { updateDriver } from '../controllers/Driver.controller.js'
const router = express.Router()


// CATEGORY:ADMIN
// Create admin account
router.post(routes.adminRegister, createAdmin)
// Admin Login
router.post(routes.adminLogin, adminLogin)
// Admin Get stats
router.get(routes.adminGetStats, verifyAdminToken, adminGetStats)
// Admin Get pending applications
router.get(routes.adminGetPendingApplications, verifyAdminToken , adminGetPendingApplications)

// CATEGORY: VEHICLES
// Create / add vehicles
router.post(routes.adminCreateVehicle, verifyAdminToken, createVehicle)
// Edit / update vehicle by id
router.patch(routes.adminEditVehicleById, verifyAdminToken, updateVehicleById)
// Delete / remove vehicle by id
router.delete(routes.adminDeleteVehicleById, verifyAdminToken, deleteVehicleById)



// CATEGORY: DRIVERS
// Get all drivers
router.get(routes.adminDrivers, verifyAdminToken, getAllDrivers)
// Approve driver by id (update)
router.patch(routes.adminApproveDriver, verifyAdminToken, approveDriverById)
// block driver by id (update)
router.patch(routes.adminBlockDriver, verifyAdminToken, blockDriverById)
// Edit / Update driver by id (update)
router.patch(routes.adminUpdateDriver, adminUpdateDriver)
// Delete driver by id (update)
router.delete(routes.adminDeleteDriver, verifyAdminToken, adminDeleteDriver)


// CATEGORY: VEHICLE BRANDS
// Create / add vehicle brands
router.post(routes.adminCreateVehicleBrand, verifyAdminToken, upload.single('vehicle-image'), createVehicleBrand)
// Edit / update vehicle brand by id
router.patch(routes.adminEditVehicleBrandById, verifyAdminToken, updateVehicleBrandById)
// Delete / remove vehicle brand by id
router.delete(routes.adminDeleteVehicleBrandById, verifyAdminToken, deleteVehicleBrandById)



// CATEGORY: TRANSACTIONS
// Create transaction
router.post(routes.adminGetTransactions, adminCreateTransaction)
// Get all transactions
router.get(routes.adminGetTransactions, verifyAdminToken, adminGetTransactions)
// Get transaction by id
router.get(routes.adminGetTransactionById, verifyAdminToken, adminGetTransactionById)
// Verify transaction
router.get(routes.adminVerifyTransaction, adminVerifyTransaction)


const adminRouter = router
export default adminRouter