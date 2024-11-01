//src/middlewares/validate.ts
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const checkValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const allErrorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(" ");

    return res.status(400).json({
      message: allErrorMessages,
      errors: errors.array(),
    });
  }
  next();
};
