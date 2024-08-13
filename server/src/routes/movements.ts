import express from "express";
import { movementValidationRules } from "../constants/validationRules";
import { MovementController } from "../controllers/movementController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAdminRole,
  checkAgentOrAdminOrClientRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// GET method to retrieve all movements
router.get(
  "/",
  checkAgentOrAdminOrClientRole,
  MovementController.getAllMovements
);

// GET method to retrieve filtered movements based on user role
router.get(
  "/filtered",
  checkAgentOrAdminOrClientRole,
  MovementController.getFilteredMovements
);

// PUT method to replace an entire movement
router.put(
  "/:id",
  movementValidationRules,
  checkValidation,
  checkAdminRole,
  MovementController.replaceMovement
);

// PATCH method to update part of a movement's information
router.patch(
  "/:id",
  movementValidationRules,
  checkValidation,
  checkAdminRole,
  MovementController.updateMovement
);

export default router;
