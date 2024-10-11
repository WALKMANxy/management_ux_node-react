// src/middlewares/validateAgent.ts
import { body, param, ValidationChain, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Validation rules for creating an agent.
 */
export const validateCreateAgent: ValidationChain[] = [
  body("id").isString().notEmpty().withMessage("ID is required and must be a string"),
  body("name").isString().notEmpty().withMessage("Name is required and must be a string"),
  body("email").optional().isEmail().withMessage("Email must be a valid email address"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("clients").optional().isArray().withMessage("Clients must be an array"),
  // Add more validations for clients if necessary
];

/**
 * Validation rules for updating an agent.
 */
export const validateUpdateAgent: ValidationChain[] = [
  param("id").isString().notEmpty().withMessage("Agent ID is required and must be a string"),
  body("name").optional().isString().withMessage("Name must be a string"),
  body("email").optional().isEmail().withMessage("Email must be a valid email address"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("clients").optional().isArray().withMessage("Clients must be an array"),
  // Add more validations for clients if necessary
];

/**
 * Validation rules for deleting an agent.
 */
export const validateDeleteAgent: ValidationChain[] = [
  param("id").isString().notEmpty().withMessage("Agent ID is required and must be a string"),
];

/**
 * Middleware to handle validation results.
 */
export const handleValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
