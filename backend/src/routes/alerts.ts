import express from "express";
import { alertValidationRules } from "../constants/validationRules";
import {
  createNewAlert,
  fetchAlertsByEntity,
  fetchAllAlerts,
  updateExistingAlert,
} from "../controllers/alertController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAgentOrAdminOrClientRole,
  checkAgentOrAdminRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// GET method to retrieve all alerts
router.get("/", checkAgentOrAdminOrClientRole, fetchAllAlerts);

// GET method to retrieve alerts by entityRole and entityCode
router.get(
  "/:entityRole/:entityCode",
  checkAgentOrAdminOrClientRole,
  fetchAlertsByEntity
);

// POST method to create a new alert
router.post(
  "/",
  alertValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  createNewAlert
);

// PUT method to replace an entire alert
router.put(
  "/:id",
  alertValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  updateExistingAlert
);

// PATCH method to update part of an alert's information
router.patch(
  "/:id",
  alertValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  updateExistingAlert
);

export default router;
