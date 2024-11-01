// src/middlewares/validateEmployee.ts
import { NextFunction, Request, Response } from "express";
import {
  body,
  param,
  ValidationChain,
  validationResult,
} from "express-validator";

/**
 * Validation rules for creating an employee.
 */
export const validateCreateEmployee: ValidationChain[] = [
  body("id")
    .isString()
    .notEmpty()
    .withMessage("id is required and must be a string"),
  body("name")
    .isString()
    .notEmpty()
    .withMessage("name is required and must be a string"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("email must be a valid email address"),
];

/**
 * Validation rules for updating an employee.
 */
export const validateUpdateEmployee: ValidationChain[] = [
  param("id")
    .isString()
    .notEmpty()
    .withMessage("Employee ID is required and must be a string"),
  body("name").optional().isString().withMessage("name must be a string"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("email must be a valid email address"),
];

/**
 * Validation rules for deleting an employee.
 */
export const validateDeleteEmployee: ValidationChain[] = [
  param("id")
    .isString()
    .notEmpty()
    .withMessage("Employee ID is required and must be a string"),
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
