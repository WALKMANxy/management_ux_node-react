// src/middleware/errorHandler.ts

import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
};