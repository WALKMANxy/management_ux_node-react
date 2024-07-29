// src/middleware/logRequests.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const logRequests = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming request: ${req.method} ${req.url} from ${req.ip}`);
  res.on('finish', () => {
    logger.info(`Response status: ${res.statusCode} for ${req.method} ${req.url}`);
  });
  next();
};

export default logRequests;
