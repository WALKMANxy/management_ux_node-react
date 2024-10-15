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
          `Error retrieving client with CODICE ${codice}: ${err.message}`
        );
      } else {
        throw new Error(
          `An unknown error occurred while retrieving client with CODICE ${codice}`
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
        { new: true, upsert: false, runValidators: true } // Do not create a new document if not found, run validators
      ).exec();
      return replacedClient;
    } catch (err: any) {
      console.error(`Error replacing client with CODICE ${codice}:`, err);
      throw err; // Let the controller handle specific error responses
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
        { new: true, runValidators: true } // Return the updated document and run validators
      ).exec();
      return updatedClient;
    } catch (err: any) {
      console.error(`Error updating client with CODICE ${codice}:`, err);
      throw err; // Let the controller handle specific error responses
    }
  }

  /**
   * Create a new client in the database.
   * @param clientData - The data for the new client.
   * @returns Promise resolving to the created Client document.
   */
  static async createClientService(clientData: IClient): Promise<IClient> {
    try {
      const newClient = new Client(clientData);
      await newClient.save();
      return newClient;
    } catch (err: any) {
      console.error("Error creating client:", err);
      throw err; // Let the controller handle specific error responses
    }
  }

  /**
   * Delete a client by CODICE.
   * @param codice - The CODICE of the client to delete.
   * @returns Promise resolving to true if deleted, false if not found.
   */
  static async deleteClientService(codice: string): Promise<boolean> {
    try {
      const result = await Client.deleteOne({ CODICE: codice }).exec();
      return result.deletedCount === 1;
    } catch (err) {
      console.error(`Error deleting client with CODICE ${codice}:`, err);
      throw new Error("Error deleting client");
    }
  }
}
