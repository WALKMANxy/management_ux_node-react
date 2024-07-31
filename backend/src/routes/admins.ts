import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateUser } from '../utils/authentication';
import { checkAdminRole } from '../utils/roleChecker';
import { AuthenticatedRequest } from '../models/types';

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

// GET method to retrieve all admins, restricted to admin users
router.get('/', checkAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filePath = path.resolve(process.env.ADMIN_DETAILS_FILE_PATH || '');
    const admins = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(admins);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error('Unexpected error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

export default router;
