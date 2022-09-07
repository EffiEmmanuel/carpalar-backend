import express from 'express'
import { routes } from "../../routes.js"
import { getAllVehicleBrands, getAllVehicles, getVehicleBrandById, getVehicleById } from "../controllers/Generic.controller.js"

// Router
const router = express.Router()


// Get all vehicles
router.get(routes.getVehicles, getAllVehicles)
// Get vehicle by id
router.get(routes.getVehicleById, getVehicleById)


// CATEGORY: VEHICLE BRANDS
// Get all vehicle brands
router.get(routes.getVehicleBrands, getAllVehicleBrands)
// Get vehicle brand by id
router.get(routes.getVehicleBrandById, getVehicleBrandById)



const genericRouter = router
export default genericRouter