import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AuthenticatedRequest } from '../models/types';
import {config} from '../config/config';

const JWT_SECRET = config.jwtSecret || '';


export const generateToken = (user: IUser) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
};

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
