import express from "express";
import fs from "fs";
import path from "path";
import { body } from "express-validator";
import { authenticateUser } from "../utils/authentication";
import { Agent, AuthenticatedRequest } from "../models/types";
import { checkValidation } from "../utils/validate";
import { checkAdminRole, checkAgentOrAdminRole } from "../utils/roleChecker";
import { config } from "../config/config";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// Validation rules
const agentValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('clients').isArray().withMessage('Clients should be an array')
];

// GET method to retrieve all agents
router.get("/", checkAgentOrAdminRole, async (req: AuthenticatedRequest, res) => {
  try {
    const filePath = path.resolve(config.agentDetailsFilePath || "");
    const agents: Agent[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(agents);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// GET method to retrieve an agent by ID
router.get("/:id", checkAgentOrAdminRole, async (req: AuthenticatedRequest, res) => {
  try {
    const filePath = path.resolve(config.agentDetailsFilePath || "");
    const agents: Agent[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const agent = agents.find(agent => agent.id === req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json(agent);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PUT method to replace an entire agent
router.put("/:id", agentValidationRules, checkValidation, checkAdminRole, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const filePath = path.resolve(config.agentDetailsFilePath || "");
    const agents: Agent[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const agentIndex = agents.findIndex((agent) => agent.id === req.params.id);
    if (agentIndex === -1) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Replace agent
    agents[agentIndex] = { id: req.params.id, name: req.body.name, email: req.body.email, phone: req.body.phone, clients: req.body.clients };

    fs.writeFileSync(filePath, JSON.stringify(agents, null, 2));
    res.status(200).json({ message: "Agent updated successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PATCH method to update part of an agent's information
router.patch("/:id", agentValidationRules, checkValidation, checkAdminRole, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const filePath = path.resolve(config.agentDetailsFilePath || "");
    const agents: Agent[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const agentIndex = agents.findIndex((agent) => agent.id === req.params.id);
    if (agentIndex === -1) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Update only the fields provided in req.body
    const updatedAgent = { ...agents[agentIndex], ...req.body };

    agents[agentIndex] = updatedAgent;

    fs.writeFileSync(filePath, JSON.stringify(agents, null, 2));
    res.status(200).json({ message: "Agent updated successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

export default router;
