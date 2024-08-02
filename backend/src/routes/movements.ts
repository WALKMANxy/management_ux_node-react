import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { body } from "express-validator";
import { authenticateUser } from "../utils/authentication";
import { AuthenticatedRequest, Movement } from "../models/types";
import { checkValidation } from "../utils/validate";
import { checkAdminRole } from "../utils/roleChecker";
import {config} from "../config/config";


const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

console.log("Movements File Path:", config.movementDetailsFilePath);

// Validation rules
const movementValidationRules = [
  body('Data Documento Precedente').notEmpty().withMessage('Data Documento Precedente is required'),
  body('Numero Lista').isInt().withMessage('Numero Lista must be an integer'),
  body('Mese').isInt().withMessage('Mese must be an integer'),
  body('Anno').isInt().withMessage('Anno must be an integer'),
  body('Ragione Sociale Cliente').notEmpty().withMessage('Ragione Sociale Cliente is required'),
  body('Codice Cliente').isInt().withMessage('Codice Cliente must be an integer'),
  body('Codice Agente').notEmpty().withMessage('Codice Agente is required'),
  body('Codice Articolo').notEmpty().withMessage('Codice Articolo is required'),
  body('Marca Articolo').notEmpty().withMessage('Marca Articolo is required'),
  body('Descrizione Articolo').notEmpty().withMessage('Descrizione Articolo is required'),
  body('Quantita').isFloat().withMessage('Quantita must be a number'),
  body('Valore').isFloat().withMessage('Valore must be a number'),
  body('Costo').isFloat().withMessage('Costo must be a number'),
  body('Prezzo Articolo').isFloat().withMessage('Prezzo Articolo must be a number')
];

// GET method to retrieve all movements
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filePath = path.resolve(config.movementDetailsFilePath || "");
    const movements: Movement[] = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );
    res.json(movements);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PUT method to replace an entire movement
router.put("/:id", movementValidationRules, checkValidation, checkAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filePath = path.resolve(config.movementDetailsFilePath || "");
    const movements: Movement[] = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    const movementIndex = movements.findIndex(
      (movement) => movement["Numero Lista"] === parseInt(req.params.id)
    );
    if (movementIndex === -1) {
      return res.status(404).json({ message: "Movement not found" });
    }

    // Replace movement
    movements[movementIndex] = { "Numero Lista": parseInt(req.params.id), ...req.body };

    fs.writeFileSync(filePath, JSON.stringify(movements, null, 2));
    res.status(200).json({ message: "Movement updated successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PATCH method to update part of a movement's information
router.patch("/:id", movementValidationRules, checkValidation, checkAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filePath = path.resolve(config.movementDetailsFilePath || "");
    const movements: Movement[] = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    const movementIndex = movements.findIndex(
      (movement) => movement["Numero Lista"] === parseInt(req.params.id)
    );
    if (movementIndex === -1) {
      return res.status(404).json({ message: "Movement not found" });
    }

    // Update only the fields provided in req.body
    const updatedMovement = { ...movements[movementIndex], ...req.body };

    // Optional: Validate fields if provided
    if (
      req.body["Numero Lista"] &&
      typeof req.body["Numero Lista"] !== "number"
    ) {
      return res
        .status(400)
        .json({ message: "Invalid input: Numero Lista should be a number" });
    }

    movements[movementIndex] = updatedMovement;

    fs.writeFileSync(filePath, JSON.stringify(movements, null, 2));
    res.status(200).json({ message: "Movement updated successfully" });
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
