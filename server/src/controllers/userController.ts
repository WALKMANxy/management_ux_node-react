import { Request, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { IUser } from "../models/User";
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
        res.status(404).json({ message: "User not found" });
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

  static async getUserLinkedEntities(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          message: "Unauthorized: User information is missing or incomplete.",
        });
        return;
      }

      const linkedEntities = await UserService.getUserLinkedEntities(
        user as IUser
      );
      if (linkedEntities) {
        user.linkedEntities = linkedEntities;
        if (user.save) {
          await user.save();
        } else {
          res.status(500).json({
            message:
              "Unable to save user data, the user is missing the 'user.save' method",
          });
          return;
        }
      }

      res.status(200).json({ linkedEntities: user.linkedEntities });
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
        res.status(404).json({ message: "User not found" });
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
}
