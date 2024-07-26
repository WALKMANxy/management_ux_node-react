import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { body } from "express-validator";
import { authenticateUser } from "../utils/auth";
import { AuthenticatedRequest, Client } from "../models/types";
import { checkValidation } from "../utils/validate";
import { checkAdminRole } from "../utils/roleChecker";


const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// Validation rules
const clientValidationRules = [
  body('RAGIONE SOCIALE').notEmpty().withMessage('Ragione Sociale is required'),
  body('INDIRIZZO').notEmpty().withMessage('Indirizzo is required'),
  body('C.A.P. - COMUNE (PROV.)').notEmpty().withMessage('CAP Comune Prov is required'),
  body('PARTITA IVA').notEmpty().withMessage('Partita IVA is required'),
  body('MP').notEmpty().withMessage('MP is required'),
  body('CS').notEmpty().withMessage('CS is required'),
  body('AG').notEmpty().withMessage('AG is required'),
];

// GET method to retrieve all clients
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filePath = path.resolve(process.env.CLIENT_DETAILS_FILE_PATH || "");
    const clients: Client[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(clients);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PUT method to replace an entire client
router.put("/:id", clientValidationRules, checkValidation, checkAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filePath = path.resolve(process.env.CLIENT_DETAILS_FILE_PATH || "");
    const clients: Client[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const clientIndex = clients.findIndex((client) => client.CODICE === req.params.id);
    if (clientIndex === -1) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Replace client
    clients[clientIndex] = { CODICE: req.params.id, ...req.body };

    fs.writeFileSync(filePath, JSON.stringify(clients, null, 2));
    res.status(200).json({ message: "Client updated successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PATCH method to update part of a client's information
router.patch("/:id", clientValidationRules, checkValidation, checkAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filePath = path.resolve(process.env.CLIENT_DETAILS_FILE_PATH || "");
    const clients: Client[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const clientIndex = clients.findIndex((client) => client.CODICE === req.params.id);
    if (clientIndex === -1) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Update only the fields provided in req.body
    const updatedClient = { ...clients[clientIndex], ...req.body };

    clients[clientIndex] = updatedClient;

    fs.writeFileSync(filePath, JSON.stringify(clients, null, 2));
    res.status(200).json({ message: "Client updated successfully" });
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
