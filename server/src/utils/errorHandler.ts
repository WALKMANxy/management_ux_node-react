// src/middleware/errorHandler.ts

import { NextFunction, Response } from "express";
import { logger } from "./logger";
import { AuthenticatedRequest } from "../models/types";

interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean; // Flag for operational (expected) errors
}

// Improved error handler middleware
export const errorHandler = (
  err: CustomError,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Determine the status code: use provided statusCode or default to 500
  const statusCode = err.statusCode || 500;

  // Log the error with additional context
  logger.error("Error occurred during request handling", {
    message: err.message,
    stack: err.stack,
    statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
    user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
  });

  // Determine response message based on environment
  const responseMessage =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again later."
      : err.message; // More detailed error message in development

  // Send JSON response with error message
  res.status(statusCode).json({
    message: responseMessage,
    ...(process.env.NODE_ENV !== "production" && { error: err.message }), // Include error details in non-production environments
  });
};
