import express from "express";
import { userValidationRules } from "../constants/validationRules";
import { UserController } from "../controllers/userController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAdminRole,
  checkAgentOrAdminOrClientRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

// Middleware to authenticate user
router.use(authenticateUser);

// GET method to retrieve all users (Admin only)
router.get("/", checkAdminRole, UserController.getAllUsers);

// GET method to retrieve a user by ID
router.get("/:id", checkAgentOrAdminOrClientRole, UserController.getUserById);

// GET method to retrieve linked entities for a user
router.get(
  "/linked-entities",
  checkAgentOrAdminOrClientRole,
  UserController.getUserLinkedEntities
);

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

export default router;
