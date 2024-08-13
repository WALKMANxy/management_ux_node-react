import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const checkValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Concatenate all error messages into a single string
    const allErrorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(" ");

    return res.status(400).json({
      message: allErrorMessages, // Return all error messages as a single string
      errors: errors.array(), // Return detailed error array
    });
  }
  next();
};
