//src/routes/movements.ts

import express from 'express';
import { Movement } from '../models/Movement';
//Get files locally, instead of using MongoDB
import fs from 'fs';
import path from 'path';

const router = express.Router();

/* router.get('/', async (req, res) => {
  try {
    const clients = await Movement.find();
    res.json(clients);
  } catch (err) {
    // Type guard to check if err is an Error
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      // Handle unexpected error type (optional)
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}); */

router.get('/', async (req, res) => {
    try {
      const filePath = path.resolve(process.env.JSON_FILE_PATH || '');
      const movements = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      res.json(movements);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

export default router;
