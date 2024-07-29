import express, { Request, Response } from "express";
import { body } from "express-validator";
import { authenticateUser } from "../utils/auth";
import { checkValidation } from "../utils/validate";
import { checkAgentOrAdminRole } from "../utils/roleChecker";
import { Visit } from "../models/Visit";
import { AuthenticatedRequest } from "../models/types";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// Validation rules
const visitValidationRules = [
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('agentId').notEmpty().withMessage('Agent ID is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date')
];

// GET method to retrieve all visits
router.get('/', async (req: Request, res: Response) => {
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
});

// POST method to create a new visit
router.post('/', visitValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId, agentId, type, reason, date, notePublic, notePrivate } = req.body;
    const visit = new Visit({
      clientId,
      agentId,
      type,
      reason,
      date,
      notePublic,
      notePrivate
    });
    await visit.save();
    res.status(201).json({ message: 'Visit created successfully', visit });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PUT method to replace an entire visit
router.put('/:id', visitValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    res.status(200).json({ message: 'Visit updated successfully', visit });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PATCH method to update part of a visit's information
router.patch('/:id', visitValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    res.status(200).json({ message: 'Visit updated successfully', visit });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

export default router;
