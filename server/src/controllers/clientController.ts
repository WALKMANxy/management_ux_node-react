import { Request, Response } from "express";
import { AuthenticatedRequest, Client } from "../models/types";
import { ClientService } from "../services/clientService";

export class ClientController {
  static async getClients(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const clients: Client[] = ClientService.getAllClients();
      res.json(clients);
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to retrieve clients: ${err.message}` });
      } else {
        res
          .status(500)
          .json({
            message: "An unknown error occurred while retrieving clients.",
          });
      }
    }
  }

  static async getClientById(req: Request, res: Response): Promise<void> {
    try {
      const client: Client | undefined = ClientService.getClientById(
        req.params.codice
      );
      if (client) {
        res.json(client);
      } else {
        res
          .status(200)
          .json({
            message: `Client with codice ${req.params.codice} not found.`,
          });
      }
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to retrieve client: ${err.message}` });
      } else {
        res
          .status(500)
          .json({
            message: "An unknown error occurred while retrieving the client.",
          });
      }
    }
  }

  static async getClientsForAgent(
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

      const userRole: string = req.user.role;
      const agentCode: string = req.user.entityCode;

      if (userRole !== "agent") {
        res
          .status(403)
          .json({
            message: "Forbidden: Only agents can access this endpoint.",
          });
        return;
      }

      const clients: Client[] = ClientService.getClientsForAgent(agentCode);
      res.json(clients);
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({
            message: `Failed to retrieve clients for agent: ${err.message}`,
          });
      } else {
        res
          .status(500)
          .json({
            message:
              "An unknown error occurred while retrieving clients for agent.",
          });
      }
    }
  }

  static async replaceClient(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const clientData: Client = req.body;
      const result = ClientService.replaceClient(req.params.id, clientData);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to replace client: ${err.message}` });
      } else {
        res
          .status(500)
          .json({
            message: "An unknown error occurred while replacing the client.",
          });
      }
    }
  }

  static async updateClient(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const clientData: Partial<Client> = req.body;
      const result = ClientService.updateClient(req.params.id, clientData);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: `Failed to update client: ${err.message}` });
      } else {
        res
          .status(500)
          .json({
            message: "An unknown error occurred while updating the client.",
          });
      }
    }
  }
}
