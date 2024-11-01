// src/services/clientService.ts
import Client, { IClient } from "../models/Client";

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

  static async replaceClient(
    codice: string,
    clientData: IClient
  ): Promise<IClient | null> {
    try {
      const replacedClient = await Client.findOneAndReplace(
        { CODICE: codice },
        clientData,
        { new: true, upsert: false, runValidators: true }
      ).exec();
      return replacedClient;
    } catch (err: any) {
      console.error(`Error replacing client with CODICE ${codice}:`, err);
      throw err;
    }
  }

  static async updateClient(
    codice: string,
    clientData: Partial<IClient>
  ): Promise<IClient | null> {
    try {
      const updatedClient = await Client.findOneAndUpdate(
        { CODICE: codice },
        { $set: clientData },
        { new: true, runValidators: true }
      ).exec();
      return updatedClient;
    } catch (err: any) {
      console.error(`Error updating client with CODICE ${codice}:`, err);
      throw err;
    }
  }

  static async createClientService(clientData: IClient): Promise<IClient> {
    try {
      const newClient = new Client(clientData);
      await newClient.save();
      return newClient;
    } catch (err: any) {
      console.error("Error creating client:", err);
      throw err;
    }
  }

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
