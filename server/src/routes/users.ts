//src/routes/users.ts
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

router.use(authenticateUser);

// GET method to retrieve all users (Admin only)
router.get("/", UserController.getAllUsers);

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
  checkAgentOrAdminOrClientRole,
  userValidationRules,
  checkValidation,
  UserController.updateUserEmail
);

// PATCH method to update user password
router.patch(
  "/:id/update-password",
  checkAgentOrAdminOrClientRole,
  userValidationRules,
  checkValidation,
  UserController.updateUserPassword
);

router.delete(
  "/:id",
  checkValidation,
  checkAdminRole,
  UserController.deleteUser
);

export default router;
