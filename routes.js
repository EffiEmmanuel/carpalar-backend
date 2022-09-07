
// CATEGORY: GENERIC
const GENERIC = '/'
const VEHICLES = '/vehicles'
const VEHICLE_BRANDS = '/vehicle-brands'

// CATEGORY: ADMIN
const ADMIN_BASE = '/admin'
const ADMIN_REGISTER = '/register'
const ADMIN_LOGIN = '/login'

// SUB-CATEGORY: DRIVERS
const ADMIN_DRIVERS = '/drivers'


export const routes = {
    // GENERIC ROUTES
    generic: GENERIC,
    getVehicles: VEHICLES,
    getVehicleById: `${VEHICLES}/:vid`,
    getVehicleBrands: VEHICLE_BRANDS,
    getVehicleBrandById: `${VEHICLE_BRANDS}/:vid`,

    // ADMIN ROUTES
    adminBase: ADMIN_BASE,
    adminRegister: ADMIN_REGISTER,
    adminLogin: ADMIN_LOGIN,

    // Vehicles
    adminCreateVehicle: `${VEHICLES}/create`,
    adminEditVehicleById: `${VEHICLES}/edit/:vid`,
    adminDeleteVehicleById: `${VEHICLES}/delete/:vid`,

    // Vegicle brands
    adminCreateVehicleBrand: `${VEHICLE_BRANDS}/create`,
    adminEditVehicleBrandById: `${VEHICLE_BRANDS}/edit/:vbid`,
    adminDeleteVehicleBrandById: `${VEHICLE_BRANDS}/delete/:vbid`,
    
    // Drivers
    adminDrivers: ADMIN_DRIVERS,
    adminApproveDriver: `${ADMIN_DRIVERS}/approve-driver/:did`,
    adminBlockDriver: `${ADMIN_DRIVERS}/block-driver/:did`


    // DRIVER ROUTES
}