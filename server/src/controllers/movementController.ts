// src/controllers/movementController.ts
import { Response } from "express";
import { IMovement } from "../models/Movement";
import { AuthenticatedRequest, serverMovement } from "../models/types";
import { MovementService } from "../services/movementService";
import { logger } from "../utils/logger";

export class MovementController {
  /**
   * Fetch all movements.
   */
  static async getAllMovements(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const movements: IMovement[] = await MovementService.getAllMovements();
      res.json(movements);
    } catch (err) {
      if (err instanceof Error) {
        logger.error(`Failed to retrieve movements: ${err.message}`);
        res
          .status(500)
          .json({ message: `Failed to retrieve movements: ${err.message}` });
      } else {
        logger.error("Failed to retrieve movements: Unknown error");
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  /**
   * Fetch filtered movements based on user role and entity code.
   */
  static async getFilteredMovements(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || !req.user.role || !req.user.entityCode) {
        logger.warn(
          "Unauthorized access attempt: User information is missing or incomplete."
        );
        res.status(401).json({
          message: "Unauthorized: User information is missing or incomplete.",
        });
        return;
      }

      const { role, entityCode } = req.user;
      const filteredMovements: IMovement[] =
        await MovementService.getFilteredMovementsByRole(role, entityCode);
      res.json(filteredMovements);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.startsWith("Forbidden")) {
          logger.warn(`Forbidden access: ${err.message}`);
          res.status(403).json({ message: err.message });
        } else {
          logger.error(`Failed to retrieve filtered movements: ${err.message}`);
          res
            .status(500)
            .json({ message: `Failed to retrieve movements: ${err.message}` });
        }
      } else {
        logger.error("Failed to retrieve filtered movements: Unknown error");
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  /**
   * Replace movements by Numero Lista.
   */
  static async replaceMovement(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const numeroLista: number = parseInt(req.params.id, 10);
      if (isNaN(numeroLista)) {
        logger.warn(`Invalid Numero Lista provided: ${req.params.id}`);
        res.status(400).json({ message: "Invalid Numero Lista provided." });
        return;
      }

      const movementData: serverMovement = req.body;

      // Optional: Validate that movementData["Numero Lista"] matches the URL parameter
      if (movementData["Numero Lista"] !== numeroLista) {
        logger.warn(
          `Numero Lista mismatch: URL parameter ${numeroLista} vs body ${movementData["Numero Lista"]}`
        );
        res.status(400).json({
          message: "Numero Lista in request body does not match URL parameter.",
        });
        return;
      }

      const result = await MovementService.replaceMovement(
        numeroLista,
        movementData
      );
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "Movement not found") {
          logger.warn(`Movement not found for Numero Lista: ${req.params.id}`);
          res.status(404).json({ message: err.message });
        } else {
          logger.error(`Failed to replace movement: ${err.message}`);
          res
            .status(500)
            .json({ message: `Failed to replace movement: ${err.message}` });
        }
      } else {
        logger.error("Failed to replace movement: Unknown error");
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  /**
   * Update movements by Numero Lista with partial data.
   */
  static async updateMovement(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const numeroLista: number = parseInt(req.params.id, 10);
      if (isNaN(numeroLista)) {
        logger.warn(`Invalid Numero Lista provided: ${req.params.id}`);
        res.status(400).json({ message: "Invalid Numero Lista provided." });
        return;
      }

      const movementData: Partial<serverMovement> = req.body;

      const result = await MovementService.updateMovement(
        numeroLista,
        movementData
      );
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "Movement not found") {
          logger.warn(`Movement not found for Numero Lista: ${req.params.id}`);
          res.status(404).json({ message: err.message });
        } else {
          logger.error(`Failed to update movement: ${err.message}`);
          res
            .status(500)
            .json({ message: `Failed to update movement: ${err.message}` });
        }
      } else {
        logger.error("Failed to update movement: Unknown error");
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
}
