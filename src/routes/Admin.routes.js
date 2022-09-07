import express from 'express'
import { routes } from '../../routes.js'
import { adminLogin, createAdmin, createVehicle, createVehicleBrand, deleteVehicleBrandById, deleteVehicleById, updateVehicleBrandById, updateVehicleById } from '../controllers/Admin.controller.js'
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
router.get(routes.adminDrivers, verifyAdminToken, createVehicle)
// Approve driver by id (update)
router.patch(routes.adminApproveDriver, verifyAdminToken, createVehicle)
// block driver by id (update)
router.patch(routes.adminBlockDriver, verifyAdminToken, createVehicle)


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