// src/routes/adminRoutes.ts
import express from "express";
import {
  createAdmin,
  deleteAdmin,
  fetchAdminById,
  fetchAllAdmins,
  updateAdmin,
} from "../controllers/adminController";
import { authenticateUser } from "../middlewares/authentication";
import { checkAdminRole } from "../middlewares/roleChecker";

const router = express.Router();

router.use(authenticateUser);
router.use(checkAdminRole);

// GET method to retrieve all admins
router.get("/", fetchAllAdmins);

// GET method to retrieve an admin by ID
router.get("/:id", fetchAdminById);

// POST method to create a new admin
router.post("/", createAdmin);

// PUT method to update an existing admin by ID
router.patch("/:id", updateAdmin);

// DELETE method to delete an admin by ID
router.delete("/:id", deleteAdmin);

export default router;
