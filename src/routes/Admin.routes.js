import express from 'express'
import { routes } from '../../routes.js'
import { adminLogin, approveDriverById, blockDriverById, createAdmin, createVehicle, createVehicleBrand, deleteVehicleBrandById, deleteVehicleById, getAllDrivers, updateVehicleBrandById, updateVehicleById } from '../controllers/Admin.controller.js'
import { upload } from '../config/multer.config.js'
import { verifyAdminToken } from '../middlewares/verifyToken.js'
const router = express.Router()


// CATEGORY:ADMIN
// Create admin account
router.post(routes.adminRegister, createAdmin)
// Admin Login
router.post(routes.adminLogin, adminLogin)

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


// CATEGORY: VEHICLE BRANDS
// Create / add vehicle brands
router.post(routes.adminCreateVehicleBrand, verifyAdminToken, upload.single('vehicle-image'), createVehicleBrand)
// Edit / update vehicle brand by id
router.patch(routes.adminEditVehicleBrandById, verifyAdminToken, updateVehicleBrandById)
// Delete / remove vehicle brand by id
router.delete(routes.adminDeleteVehicleBrandById, verifyAdminToken, deleteVehicleBrandById)



// CATEGORY: TRANSACTIONS
// Get all transactions
// Get transaction by id
// Verify transaction


const adminRouter = router
export default adminRouter