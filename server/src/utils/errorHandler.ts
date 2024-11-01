// src/middleware/errorHandler.ts
import { NextFunction, Response } from "express";
import { logger } from "./logger";
import { AuthenticatedRequest } from "../models/types";

interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Improved error handler middleware
export const errorHandler = (
  err: CustomError,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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
      : err.message; 

  // Send JSON response with error message
  res.status(statusCode).json({
    message: responseMessage,
    ...(process.env.NODE_ENV !== "production" && { error: err.message }),
  });
};
