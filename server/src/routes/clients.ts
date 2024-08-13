import express from "express";
import { clientValidationRules } from "../constants/validationRules";
import { ClientController } from "../controllers/clientController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAdminRole,
  checkAgentOrAdminOrClientRole,
} from "../middlewares/roleChecker";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// GET method to retrieve all clients
router.get("/", checkAgentOrAdminOrClientRole, ClientController.getClients);

// GET method to retrieve a client by codice
router.get(
  "/codice/:codice",
  checkAgentOrAdminOrClientRole,
  ClientController.getClientById
);

// GET method to retrieve clients for an agent
router.get(
  "/by-agent",
  checkAgentOrAdminOrClientRole,
  ClientController.getClientsForAgent
);

// PUT method to replace an entire client
router.put(
  "/:id",
  clientValidationRules,
  checkValidation,
  checkAdminRole,
  ClientController.replaceClient
);

// PATCH method to update part of a client's information
router.patch(
  "/:id",
  clientValidationRules,
  checkValidation,
  checkAdminRole,
  ClientController.updateClient
);

export default router;
