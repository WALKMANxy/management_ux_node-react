// src/services/clientService.ts

import Client, { IClient } from "../models/Client";

/**
 * Fetch all clients from the database.
 * @returns Promise resolving to an array of Client documents.
 */
export class ClientService {
  static async getAllClients(): Promise<IClient[]> {
    try {
      const clients = await Client.find().exec();
      return clients;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error retrieving clients: ${err.message}`);
      } else {
        throw new Error("An unknown error occurred while retrieving clients");
      }
    }
  }

  /**
   * Fetch a single client by CODICE from the database.
   * @param codice - The CODICE of the client to fetch.
   * @returns Promise resolving to a Client document or null if not found.
   */
  static async getClientById(codice: string): Promise<IClient | null> {
    try {
      const client = await Client.findOne({ CODICE: codice }).exec();
      return client;
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

  /**
   * Fetch clients associated with a specific agent code (AG).
   * @param agentCode - The AG code of the agent.
   * @returns Promise resolving to an array of Client documents.
   */
  static async getClientsForAgent(agentCode: string): Promise<IClient[]> {
    try {
      const clients = await Client.find({ AG: agentCode }).exec();
      return clients;
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

  /**
   * Replace a client by CODICE with new data.
   * @param codice - The CODICE of the client to replace.
   * @param clientData - The new client data.
   * @returns Promise resolving to the replaced Client document or null if not found.
   */
  static async replaceClient(
    codice: string,
    clientData: IClient
  ): Promise<IClient | null> {
    try {
      const replacedClient = await Client.findOneAndReplace(
        { CODICE: codice },
        clientData,
        { new: true, upsert: false } // Do not create a new document if not found
      ).exec();
      return replacedClient;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `Error replacing client with CODICE ${codice}: ${err.message}`
        );
      } else {
        throw new Error(
          `An unknown error occurred while replacing client with CODICE ${codice}`
        );
      }
    }
  }

  /**
   * Update a client by CODICE with partial data.
   * @param codice - The CODICE of the client to update.
   * @param clientData - Partial client data to update.
   * @returns Promise resolving to the updated Client document or null if not found.
   */
  static async updateClient(
    codice: string,
    clientData: Partial<IClient>
  ): Promise<IClient | null> {
    try {
      const updatedClient = await Client.findOneAndUpdate(
        { CODICE: codice },
        { $set: clientData },
        { new: true }
      ).exec();
      return updatedClient;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `Error updating client with CODICE ${codice}: ${err.message}`
        );
      } else {
        throw new Error(
          `An unknown error occurred while updating client with CODICE ${codice}`
        );
      }
    }
  }
}
