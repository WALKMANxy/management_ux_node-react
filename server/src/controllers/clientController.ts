// src/controllers/clientController.ts
import { Request, Response } from "express";
import { IClient } from "../models/Client";
import { AuthenticatedRequest } from "../models/types";
import { ClientService } from "../services/clientService";

export class ClientController {
  /**
   * Fetch all clients.
   */
  static async getClients(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const clients: IClient[] = await ClientService.getAllClients();
      res.json(clients);
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to retrieve clients: ${err.message}` });
      } else {
        res.status(500).json({
          message: "An unknown error occurred while retrieving clients.",
        });
      }
    }
  }

  /**
   * Fetch a client by CODICE.
   */
  static async getClientById(req: Request, res: Response): Promise<void> {
    try {
      const codice = req.params.codice;
      const client: IClient | null = await ClientService.getClientById(codice);
      if (client) {
        res.json(client);
      } else {
        res.status(404).json({
          message: `Client with CODICE ${codice} not found.`,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to retrieve client: ${err.message}` });
      } else {
        res.status(500).json({
          message: "An unknown error occurred while retrieving the client.",
        });
      }
    }
  }

  /**
   * Fetch clients associated with the authenticated agent.
   */
  static async getClientsForAgent(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user || !req.user.role || !req.user.entityCode) {
        res.status(401).json({
          message: "Unauthorized: User information is missing or incomplete.",
        });
        return;
      }

      const userRole: string = req.user.role;
      const agentCode: string = req.user.entityCode;

      if (userRole !== "agent") {
        res.status(403).json({
          message: "Forbidden: Only agents can access this endpoint.",
        });
        return;
      }

      const clients: IClient[] = await ClientService.getClientsForAgent(
        agentCode
      );
      res.json(clients);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).json({
          message: `Failed to retrieve clients for agent: ${err.message}`,
        });
      } else {
        res.status(500).json({
          message:
            "An unknown error occurred while retrieving clients for agent.",
        });
      }
    }
  }

  /**
   * Replace a client by CODICE.
   */
  static async replaceClient(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const codice = req.params.id;
      const clientData: IClient = req.body;

      // Optional: Validate that clientData.CODICE matches the URL parameter
      if (clientData.CODICE !== codice) {
        res.status(400).json({
          message: "CODICE in request body does not match URL parameter.",
        });
        return;
      }

      const replacedClient: IClient | null = await ClientService.replaceClient(
        codice,
        clientData
      );
      if (replacedClient) {
        res
          .status(200)
          .json({ message: "Client replaced successfully", replacedClient });
      } else {
        res.status(404).json({ message: "Client not found" });
      }
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to replace client: ${err.message}` });
      } else {
        res.status(500).json({
          message: "An unknown error occurred while replacing the client.",
        });
      }
    }
  }

  /**
   * Update a client by CODICE.
   */
  static async updateClient(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const codice = req.params.id;
      const clientData: Partial<IClient> = req.body;

      const updatedClient: IClient | null = await ClientService.updateClient(
        codice,
        clientData
      );
      if (updatedClient) {
        res
          .status(200)
          .json({ message: "Client updated successfully", updatedClient });
      } else {
        res.status(404).json({ message: "Client not found" });
      }
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to update client: ${err.message}` });
      } else {
        res.status(500).json({
          message: "An unknown error occurred while updating the client.",
        });
      }
    }
  }
}
