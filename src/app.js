import {} from "dotenv/config";
import express, { json, urlencoded } from "express";
import cors from "cors";
import { routes } from "../routes.js";
import adminRouter from "./routes/Admin.routes.js";
import { connectDB } from './config/db.config.js'
import genericRouter from "./routes/generic.routes.js";

const app = express();

// Connect to DB
connectDB()

// Middlewares
app.use(cors());
app.use(json({limit: '50mb'}));
app.use(urlencoded({ extended: false, limit: '50mb' }));

// Admin router
app.use(routes.generic, genericRouter)
app.use(routes.adminBase, adminRouter);

// PORT
const PORT = process.env.PORT;
app.listen(PORT, (req, res) => {
  console.log(`Server listening on port:${PORT}`);
});
