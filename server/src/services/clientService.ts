import fs from "fs";
import path from "path";
import { config } from "../config/config";
import { Client } from "../models/types";
import {
  getClientById,
  getClientsByAgentCode,
  getClientsFromFile,
} from "../utils/fetchClientsUtil";

export class ClientService {
  static getAllClients(): Client[] {
    try {
      return getClientsFromFile();
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error retrieving clients: ${err.message}`);
      } else {
        throw new Error("An unknown error occurred while retrieving clients");
      }
    }
  }

  static getClientById(codice: string): Client | undefined {
    try {
      return getClientById(codice);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `Error retrieving client with codice ${codice}: ${err.message}`
        );
      } else {
        throw new Error(
          `An unknown error occurred while retrieving client with codice ${codice}`
        );
      }
    }
  }

  static getClientsForAgent(agentCode: string): Client[] {
    try {
      return getClientsByAgentCode(agentCode);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `Error retrieving clients for agent with code ${agentCode}: ${err.message}`
        );
      } else {
        throw new Error(
          `An unknown error occurred while retrieving clients for agent with code ${agentCode}`
        );
      }
    }
  }

  static replaceClient(id: string, clientData: Client): { message: string } {
    try {
      const filePath = path.resolve(config.clientDetailsFilePath || "");
      const clients: Client[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const clientIndex = clients.findIndex((client) => client.CODICE === id);
      if (clientIndex === -1) {
        throw new Error(`Client with CODICE ${id} not found`);
      }

      // Replace client with the provided clientData
      clients[clientIndex] = clientData;

      fs.writeFileSync(filePath, JSON.stringify(clients, null, 2));
      return { message: "Client updated successfully" };
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `Error replacing client with CODICE ${id}: ${err.message}`
        );
      } else {
        throw new Error(
          `An unknown error occurred while replacing client with CODICE ${id}`
        );
      }
    }
  }

  static updateClient(
    id: string,
    clientData: Partial<Client>
  ): { message: string } {
    try {
      const filePath = path.resolve(config.clientDetailsFilePath || "");
      const clients: Client[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const clientIndex = clients.findIndex((client) => client.CODICE === id);
      if (clientIndex === -1) {
        throw new Error(`Client with CODICE ${id} not found`);
      }

      // Update only the fields provided in clientData
      const updatedClient = { ...clients[clientIndex], ...clientData };

      clients[clientIndex] = updatedClient;

      fs.writeFileSync(filePath, JSON.stringify(clients, null, 2));
      return { message: "Client updated successfully" };
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `Error updating client with CODICE ${id}: ${err.message}`
        );
      } else {
        throw new Error(
          `An unknown error occurred while updating client with CODICE ${id}`
        );
      }
    }
  }
}
