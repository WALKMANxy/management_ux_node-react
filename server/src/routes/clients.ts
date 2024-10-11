// src/routes/clientRoutes.ts
import express from "express";
import { ClientController } from "../controllers/clientController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAdminRole,
  checkAgentOrAdminOrClientRole,
} from "../middlewares/roleChecker";
import {
  validateCreateClient,
  validateUpdateClient,
  validateDeleteClient,
  handleValidation,
} from "../middlewares/validateClient";

const router = express.Router();

// Middleware to authenticate user
router.use(authenticateUser);

// GET method to retrieve all clients
router.get(
  "/",
  checkAgentOrAdminOrClientRole,
  ClientController.getClients
);

// GET method to retrieve a client by CODICE
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

// POST method to create a new client
router.post(
  "/",
  validateCreateClient,
  handleValidation,
  checkAdminRole,
  ClientController.createClient
);

// PUT method to replace an entire client
router.put(
  "/:id",
  validateUpdateClient,
  handleValidation,
  checkAdminRole,
  ClientController.replaceClient
);

// PATCH method to update part of a client's information
router.patch(
  "/:id",
  validateUpdateClient,
  handleValidation,
  checkAdminRole,
  ClientController.updateClient
);

// DELETE method to delete a client by CODICE
router.delete(
  "/:id",
  validateDeleteClient,
  handleValidation,
  checkAdminRole,
  ClientController.deleteClient
);

export default router;
