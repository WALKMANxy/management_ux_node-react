import express from "express";
import { fetchAdminById, fetchAllAdmins } from "../controllers/adminController";
import { authenticateUser } from "../middlewares/authentication";
import { checkAdminRole } from "../middlewares/roleChecker";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

//console.log("Admin Details File Path:", config.adminDetailsFilePath);

// GET method to retrieve all admins, restricted to admin users
router.get("/", checkAdminRole, fetchAllAdmins);

// GET method to retrieve an admin by ID, restricted to admin users
router.get("/:id", checkAdminRole, fetchAdminById);

export default router;
