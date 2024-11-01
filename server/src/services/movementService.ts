// src/services/movementService.ts
import Movement, { IMovement } from "../models/Movement";
import { logger } from "../utils/logger";

export class MovementService {
  static async getAllMovements(): Promise<IMovement[]> {
    try {
      const movements = await Movement.find().exec();
      return movements;
    } catch (err) {
      logger.error(
        `Error retrieving all movements: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      throw new Error(
        `Error retrieving all movements: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async getFilteredMovementsByRole(
    role: string,
    entityCode: string
  ): Promise<IMovement[]> {
    try {
      let filter: any = {};

      if (role === "client") {
        filter["Codice Cliente"] = entityCode;
      } else if (role === "agent") {
        filter["Codice Agente"] = entityCode;
      } else {
        logger.warn(`Forbidden access attempted by role: ${role}`);
        throw new Error(
          "Forbidden: You're neither an agent nor client, so you shouldn't be here."
        );
      }

      const movements = await Movement.find(filter).exec();
      return movements;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.startsWith("Forbidden")) {
          logger.warn(`Forbidden access: ${err.message}`);
          throw err;
        } else if (err.name === "CastError") {
          logger.error(`Type error: ${err.message}`);
          throw new Error(`Type error: ${err.message}`);
        } else {
          logger.error(`Error retrieving filtered movements: ${err.message}`);
          throw new Error(
            `Error retrieving filtered movements: ${err.message}`
          );
        }
      } else {
        logger.error(`Error retrieving filtered movements: Unknown error`);
        throw new Error(`Error retrieving filtered movements: Unknown error`);
      }
    }
  }

  static async replaceMovement(
    numeroLista: number,
    movementData: IMovement
  ): Promise<{ message: string }> {
    try {
      // Replace all movements with the given Numero Lista
      const result = await Movement.updateMany(
        { "Numero Lista": numeroLista },
        { $set: movementData }
      ).exec();

      if (result.matchedCount === 0) {
        throw new Error("Movement not found");
      }

      /* logger.info(
        `Replaced ${result.modifiedCount} movement(s) with Numero Lista ${numeroLista}`
      ); */
      return { message: "Movement(s) replaced successfully" };
    } catch (err) {
      logger.error(
        `Error replacing movement with Numero Lista ${numeroLista}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      throw new Error(
        `Error replacing movement: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async updateMovement(
    numeroLista: number,
    movementData: Partial<IMovement>
  ): Promise<{ message: string }> {
    try {
      // Update all movements with the given Numero Lista
      const result = await Movement.updateMany(
        { "Numero Lista": numeroLista },
        { $set: movementData }
      ).exec();

      if (result.matchedCount === 0) {
        throw new Error("Movement not found");
      }

      /*  logger.info(
        `Updated ${result.modifiedCount} movement(s) with Numero Lista ${numeroLista}`
      ); */
      return { message: "Movement(s) updated successfully" };
    } catch (err) {
      logger.error(
        `Error updating movement with Numero Lista ${numeroLista}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      throw new Error(
        `Error updating movement: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }
}
