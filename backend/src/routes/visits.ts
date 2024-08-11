import express, { Request, Response } from "express";
import { body } from "express-validator";
import { authenticateUser } from "../middlewares/authentication";
import {
  checkAgentOrAdminOrClientRole,
  checkAgentOrAdminRole,
} from "../middlewares/roleChecker";
import { Visit } from "../models/Visit";
import { AuthenticatedRequest } from "../models/types";
import { checkValidation } from "../middlewares/validate";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// Validation rules
const visitValidationRules = [
  body("clientId").notEmpty().withMessage("Client ID is required"),
  body("type").notEmpty().withMessage("Type is required"),
  body("visitReason").notEmpty().withMessage("Reason is required"),
  body("date").isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("visitIssuedBy").notEmpty().withMessage("Visit issued by is required"),
];

// GET method to retrieve all visits
router.get(
  "/",
  checkAgentOrAdminOrClientRole,
  async (req: Request, res: Response) => {
    try {
      const visits = await Visit.find();

      res.json(visits);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

// POST method to create a new visit
router.post(
  "/",
  visitValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        clientId,
        type,
        visitReason,
        date,
        notePublic,
        notePrivate,
        visitIssuedBy,
      } = req.body;
      const visit = new Visit({
        clientId,
        type,
        visitReason,
        date,
        notePublic,
        notePrivate,
        visitIssuedBy,
      });
      await visit.save();
      res.status(201).json({ message: "Visit created successfully", visit });
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

// PUT method to replace an entire visit
router.put(
  "/:id",
  visitValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!visit) {
        return res.status(404).json({ message: "Visit not found" });
      }
      res.status(200).json({ message: "Visit updated successfully", visit });
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

// PATCH method to update part of a visit's information
router.patch(
  "/:id",
  visitValidationRules,
  checkValidation,
  checkAgentOrAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!visit) {
        return res.status(404).json({ message: "Visit not found" });
      }
      res.status(200).json({ message: "Visit updated successfully", visit });
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

export default router;
