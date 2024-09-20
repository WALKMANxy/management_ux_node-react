//src/routes/agents.ts
import express from "express";
import { agentValidationRules } from "../constants/validationRules";
import {
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
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

// Middleware to authenticate and authorize user
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


// PUT method to replace an entire agent
router.put(
  "/:id",
  agentValidationRules,
  checkValidation,
  checkAdminRole,
  replaceAgent
);

// PATCH method to update part of an agent's information
router.patch(
  "/:id",
  agentValidationRules,
  checkValidation,
  checkAdminRole,
  updateAgent
);

export default router;
