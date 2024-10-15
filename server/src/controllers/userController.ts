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
  // Controller action to update the user's email
  static async updateUserEmail(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { currentEmail, currentPassword, newEmail } = req.body;

      if (!currentEmail || !currentPassword || !newEmail) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const user = await UserService.updateUserEmail(
        req.params.id,
        currentEmail,
        currentPassword,
        newEmail
      );

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({
        message: "Email updated successfully. Please verify your new email.",
        user,
      });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  // Controller action to update the user's password
  static async updateUserPassword(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { currentEmail, currentPassword, newPassword } = req.body;

      if (!currentEmail || !currentPassword || !newPassword) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const user = await UserService.updateUserPassword(
        req.params.id,
        currentEmail,
        currentPassword,
        newPassword
      );

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({
        message: "Password updated successfully. Please verify your email.",
        user,
      });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await UserService.deleteUser(req.params.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}
