//src/middlewares/csp.ts

import { Request, Response, NextFunction } from "express";

export const csp = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';"
  );
  next();
};
