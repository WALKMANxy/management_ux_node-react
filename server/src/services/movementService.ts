import { config } from "../config/config";
import { Movement } from "../models/types";
import { readFile, resolveFilePath, writeFile } from "../utils/fileUtils";

export class MovementService {
  static getAllMovements(): Movement[] {
    const filePath = resolveFilePath(config.jsonFilePath || "");
    const movements: Movement[] = JSON.parse(readFile(filePath));
    return movements;
  }

  static getFilteredMovementsByRole(
    role: string,
    entityCode: string
  ): Movement[] {
    const movements = this.getAllMovements();

    if (role === "client") {
      return movements.filter(
        (movement) => movement["Codice Cliente"] === entityCode
      );
    } else if (role === "agent") {
      return movements.filter(
        (movement) => movement["Codice Agente"] === entityCode
      );
    } else {
      throw new Error(
        "Forbidden: You're neither an agent nor client, so you shouldn't be here."
      );
    }
  }

  static replaceMovement(
    id: number,
    movementData: Movement
  ): { message: string } {
    const filePath = resolveFilePath(config.jsonFilePath || "");
    const movements: Movement[] = JSON.parse(readFile(filePath));

    const movementIndex = movements.findIndex(
      (movement) => movement["Numero Lista"] === id
    );
    if (movementIndex === -1) {
      throw new Error("Movement not found");
    }

    movements[movementIndex] = { ...movementData, "Numero Lista": id };

    writeFile(filePath, movements);
    return { message: "Movement updated successfully" };
  }

  static updateMovement(
    id: number,
    movementData: Partial<Movement>
  ): { message: string } {
    const filePath = resolveFilePath(config.jsonFilePath || "");
    const movements: Movement[] = JSON.parse(readFile(filePath));

    const movementIndex = movements.findIndex(
      (movement) => movement["Numero Lista"] === id
    );
    if (movementIndex === -1) {
      throw new Error("Movement not found");
    }

    const updatedMovement = { ...movements[movementIndex], ...movementData };
    movements[movementIndex] = updatedMovement;

    writeFile(filePath, movements);
    return { message: "Movement updated successfully" };
  }
}
