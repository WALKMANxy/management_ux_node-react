//src/routes/clients.ts

import express from 'express';
import { Client } from '../models/Client';
//Get files locally, instead of using MongoDB
import fs from 'fs';
import path from 'path';


const router = express.Router();

/* router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
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
      const filePath = path.resolve(process.env.CLIENT_DETAILS_FILE_PATH || '');
      const clients = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      res.json(clients);
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
