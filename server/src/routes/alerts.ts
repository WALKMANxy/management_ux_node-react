// routes/alerts.ts

import express from "express";
import { alertValidationRules } from "../constants/validationRules";
import {
  AlertController,
  EmitAlertFunction,
} from "../controllers/alertController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAgentOrAdminOrClientRole,
  checkAgentOrAdminRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

export const setupAlertRoutes = (emitAlert: EmitAlertFunction) => {
  const router = express.Router();
  const alertController = new AlertController(emitAlert);

  // Middleware to authenticate and authorize user
  router.use(authenticateUser);

  // GET method to retrieve all alerts
  router.get(
    "/",
    checkAgentOrAdminOrClientRole,
    alertController.fetchAllAlerts
  );

  // GET method to retrieve alerts by entityRole and entityCode
  router.get(
    "/:entityRole/:entityCode",
    checkAgentOrAdminOrClientRole,
    alertController.fetchAlertsByEntity
  );

  // GET method to retrieve alerts by alertIssuedBy
  router.get(
    "/issued-by/:alertIssuedBy",
    checkAgentOrAdminRole,
    alertController.fetchAlertsByIssuer
  );

  // POST method to create a new alert
  router.post(
    "/",
    alertValidationRules,
    checkValidation,
    checkAgentOrAdminRole,
    alertController.createNewAlert
  );

  // PUT method to replace an entire alert
  router.put(
    "/:id",
    alertValidationRules,
    checkValidation,
    checkAgentOrAdminRole,
    alertController.updateExistingAlert
  );

  // PATCH method to update part of an alert's information
  router.patch(
    "/:id",
    alertValidationRules,
    checkValidation,
    checkAgentOrAdminRole,
    alertController.updateExistingAlert
  );

  return router;
};

export default setupAlertRoutes;
