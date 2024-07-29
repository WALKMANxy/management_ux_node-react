import express, { Request, Response } from "express";
import { body } from "express-validator";
import { authenticateUser } from "../utils/auth";
import { checkValidation } from "../utils/validate";
import { checkAgentOrAdminRole } from "../utils/roleChecker";
import { Promo } from "../models/Promo";
import { AuthenticatedRequest } from "../models/types";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// Validation rules
const promoValidationRules = [
  body('clientsId').isArray().withMessage('Clients ID must be an array'),
  body('agentsId').isArray().withMessage('Agents ID must be an array'),
  body('type').notEmpty().withMessage('Type is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('discount').notEmpty().withMessage('Discount is required'),
  body('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date')
];

// GET method to retrieve all promos
router.get('/', async (req: Request, res: Response) => {
  try {
    const promos = await Promo.find();
    res.json(promos);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// POST method to create a new promo
router.post('/', promoValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientsId, agentsId, type, name, discount, startDate, endDate } = req.body;
    const promo = new Promo({
      clientsId,
      agentsId,
      type,
      name,
      discount,
      startDate,
      endDate
    });
    await promo.save();
    res.status(201).json({ message: 'Promo created successfully', promo });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PUT method to replace an entire promo
router.put('/:id', promoValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    res.status(200).json({ message: 'Promo updated successfully', promo });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// PATCH method to update part of a promo's information
router.patch('/:id', promoValidationRules, checkValidation, checkAgentOrAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    res.status(200).json({ message: 'Promo updated successfully', promo });
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
