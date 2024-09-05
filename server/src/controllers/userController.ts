import { Request, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { UserService } from "../services/userService";

export class UserController {
  static async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        res.status(200).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async updateUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      if (!user) {
        res.status(200).json({ message: "User not found" });
        return;
      }
      res.status(200).json({ message: "User updated successfully", user });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
  static async getUsersByBatchIds(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body; // Get user IDs from the request body
      if (!Array.isArray(ids) || !ids.length) {
        res.status(400).json({ message: "Invalid or missing IDs array" });
        return;
      }

      const users = await UserService.getUsersByIds(ids);

      if (!users.length) {
        res.status(200).json({ message: "No users found" });
        return;
      }

      res.json(users);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}
