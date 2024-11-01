// src/routes/agentRoutes.ts
import express from "express";
import {
  createAgent,
  deleteAgent,
  fetchAgentByClientEntityCode,
  fetchAgentById,
  fetchAllAgents,
  replaceAgent,
  updateAgent,
} from "../controllers/agentController";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAdminRole,
  checkAgentOrAdminOrClientRole,
  checkAgentOrAdminRole,
} from "../middlewares/roleChecker";
import {
  handleValidation,
  validateCreateAgent,
  validateDeleteAgent,
  validateUpdateAgent,
} from "../middlewares/validateAgent";

const router = express.Router();

router.use(authenticateUser);

// GET method to retrieve an agent by the client's entity code
router.get(
  "/by-client-entity-code",
  checkAgentOrAdminOrClientRole,
  fetchAgentByClientEntityCode
);

// GET method to retrieve all agents
router.get("/", checkAgentOrAdminRole, fetchAllAgents);

// GET method to retrieve an agent by ID
router.get("/:id", checkAgentOrAdminOrClientRole, fetchAgentById);

// POST method to create a new agent
router.post(
  "/",
  validateCreateAgent,
  handleValidation,
  checkAdminRole,
  createAgent
);

// PUT method to replace an entire agent
router.put(
  "/:id",
  validateUpdateAgent,
  handleValidation,
  checkAdminRole,
  replaceAgent
);

// PATCH method to update part of an agent's information
router.patch(
  "/:id",
  validateUpdateAgent,
  handleValidation,
  checkAdminRole,
  updateAgent
);

// DELETE method to delete an agent by ID
router.delete(
  "/:id",
  validateDeleteAgent,
  handleValidation,
  checkAdminRole,
  deleteAgent
);

export default router;
