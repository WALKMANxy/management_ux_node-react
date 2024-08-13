import { Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { MovementService } from "../services/movementService";

export class MovementController {
  static async getAllMovements(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const movements = MovementService.getAllMovements();
      res.json(movements);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async getFilteredMovements(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || !req.user.role || !req.user.entityCode) {
        res
          .status(401)
          .json({
            message: "Unauthorized: User information is missing or incomplete.",
          });
        return;
      }

      const { role, entityCode } = req.user;
      const filteredMovements = MovementService.getFilteredMovementsByRole(
        role,
        entityCode
      );
      res.json(filteredMovements);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Forbidden")) {
          res.status(403).json({ message: err.message });
        } else {
          res.status(500).json({ message: err.message });
        }
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async replaceMovement(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const movementData = req.body;
      const result = MovementService.replaceMovement(
        parseInt(req.params.id),
        movementData
      );
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  static async updateMovement(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const movementData = req.body;
      const result = MovementService.updateMovement(
        parseInt(req.params.id),
        movementData
      );
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}
