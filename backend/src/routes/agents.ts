//src/routes/agents.ts

import express from 'express';
import { Agent } from '../models/Agent';
//Get files locally, instead of using MongoDB
import fs from 'fs';
import path from 'path';

const router = express.Router();

/* router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().populate('clients');
    res.json(agents);
  } catch (err) {
    // Type guard to check if err is an Error
    if (err instanceof Error) {
      res.status(500).json({ status: "error", message: err.message });
    } else {
      // Handle unexpected error type (optional)
      console.error("Unexpected error:", err);
      res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
  }
}); */

router.get('/', async (req, res) => {
    try {
      const filePath = path.resolve(process.env.AGENT_DETAILS_FILE_PATH || '');
      const agents = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      res.json(agents);
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
