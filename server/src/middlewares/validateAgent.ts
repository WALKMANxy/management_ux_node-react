// src/middlewares/validateAgent.ts
import { NextFunction, Request, Response } from "express";
import {
  body,
  param,
  ValidationChain,
  validationResult,
} from "express-validator";

export const validateCreateAgent: ValidationChain[] = [
  body("id")
    .isString()
    .notEmpty()
    .withMessage("ID is required and must be a string"),
  body("name")
    .isString()
    .notEmpty()
    .withMessage("Name is required and must be a string"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("clients").optional().isArray().withMessage("Clients must be an array"),
];

export const validateUpdateAgent: ValidationChain[] = [
  param("id")
    .isString()
    .notEmpty()
    .withMessage("Agent ID is required and must be a string"),
  body("name").optional().isString().withMessage("Name must be a string"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("clients").optional().isArray().withMessage("Clients must be an array"),
];

export const validateDeleteAgent: ValidationChain[] = [
  param("id")
    .isString()
    .notEmpty()
    .withMessage("Agent ID is required and must be a string"),
];

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
