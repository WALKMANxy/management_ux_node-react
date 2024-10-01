import express from "express";
import { userValidationRules } from "../constants/validationRules";
import { UserController } from "../controllers/userController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAdminRole,
  checkAgentOrAdminOrClientRole,
  checkAllowedRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();
router.use(checkAllowedRole);

// Middleware to authenticate user
router.use(authenticateUser);

// GET method to retrieve all users (Admin only)
router.get("/", checkAllowedRole, UserController.getAllUsers);

// GET method to retrieve a user by ID
router.get("/:id", checkAllowedRole, UserController.getUserById);

// POST method to retrieve users by batch of IDs
router.post("/batch", checkAllowedRole, UserController.getUsersByBatchIds);

// PUT method to replace a user (Admin only)
router.put(
  "/:id",
  userValidationRules,
  checkValidation,
  checkAdminRole,
  UserController.updateUser
);

// PATCH method to update part of a user's information (Admin only)
router.patch(
  "/:id",
  userValidationRules,
  checkValidation,
  checkAdminRole,
  UserController.updateUser
);

// PATCH method to update user email
router.patch(
  "/:id/update-email",
  checkAgentOrAdminOrClientRole, // Ensure the user is authorized
  userValidationRules, // Specific validation rules for updating email
  checkValidation,
  UserController.updateUserEmail // Controller method to update email
);

// PATCH method to update user password
router.patch(
  "/:id/update-password",
  checkAgentOrAdminOrClientRole, // Ensure the user is authorized
  userValidationRules, // Specific validation rules for updating password
  checkValidation,
  UserController.updateUserPassword // Controller method to update password
);

export default router;
