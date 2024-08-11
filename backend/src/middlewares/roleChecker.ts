import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../models/types';

export const checkAdminRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access only' });
  }
};

export const checkAgentOrAdminRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'agent')) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin or Agent access only' });
  }
};

export const checkAgentOrAdminOrClientRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'agent' || req.user.role === 'client')) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin or Agent or Client access only' });
  }
};
