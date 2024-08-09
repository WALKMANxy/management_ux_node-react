import express, { Request, Response } from "express";
import { body } from "express-validator";
import { authenticateUser } from "../utils/authentication";
import { checkValidation } from "../utils/validate";
import { checkAgentOrAdminOrClientRole, checkAgentOrAdminRole } from "../utils/roleChecker";
import { Alert } from "../models/Alert";
import { AuthenticatedRequest } from "../models/types";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// Validation rules
const alertValidationRules = [
  body('alertReason').notEmpty().withMessage('Alert reason is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('severity').isIn(['low', 'medium', 'high']).withMessage('Severity must be low, medium, or high')
];

// GET method to retrieve all alerts
router.get('/', checkAgentOrAdminOrClientRole, async (req: Request, res: Response) => {
  try {
    const alerts = await Alert.find();
    res.json(alerts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// GET method to retrieve alerts by entityRole and entityCode
router.get('/:entityType/:entityCode', checkAgentOrAdminOrClientRole, async (req: Request, res: Response) => {
  const { entityRole, entityCode } = req.params;
  try {
    const alerts = await Alert.find({ entityRole, entityCode });
    if (alerts.length === 0) {
      return res.status(404).json({ message: 'No alerts found for the specified target' });
    }
    res.json(alerts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// POST method to create a new alert
router.post('/', alertValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { alertReason, message, severity, alertIssuedBy, entityRole, entityCode } = req.body;
    const alert = new Alert({
      alertReason,
      message,
      severity,
      alertIssuedBy,
      entityRole,
      entityCode
    });
    await alert.save();
    res.status(201).json({ message: 'Alert created successfully', alert });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PUT method to replace an entire alert
router.put('/:id', alertValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.status(200).json({ message: 'Alert updated successfully', alert });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PATCH method to update part of an alert's information
router.patch('/:id', alertValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.status(200).json({ message: 'Alert updated successfully', alert });
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
