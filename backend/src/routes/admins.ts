import express, { Response } from "express";
import fs from "fs";
import path from "path";
import { config } from "../config/config";
import { Admin, AuthenticatedRequest } from "../models/types";
import { authenticateUser } from "../utils/authentication";
import { checkAdminRole } from "../utils/roleChecker";

const router = express.Router();

// Middleware to authenticate and authorize user
router.use(authenticateUser);

console.log("Admin Details File Path:", config.adminDetailsFilePath);

// GET method to retrieve all admins, restricted to admin users
router.get(
  "/",
  checkAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filePath = path.resolve(config.adminDetailsFilePath || "");
      const admins: Admin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.json(admins);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

// GET method to retrieve an admin by ID, restricted to admin users
router.get(
  "/:id",
  checkAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filePath = path.resolve(config.adminDetailsFilePath || "");
      const admins: Admin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const admin = admins.find((admin) => admin.id === req.params.id);

      res.json(admin);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

export default router;
