import fs from "fs";
import path from "path";
import { config } from "../config/config";
import { Client } from "../models/types"; // Adjust the import based on your project structure

// Utility function to fetch clients from the file
export const getClientsFromFile = (): Client[] => {
  const filePath = path.resolve(config.clientDetailsFilePath || "");
  const clients: Client[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return clients;
};

// Utility function to get a client by codice
export const getClientById = (codice: string): Client | undefined => {
  const clients = getClientsFromFile();
  return clients.find((client) => client.CODICE === codice);
};

// Utility function to fetch clients by agent code (AG)
export const getClientsByAgentCode = (agentCode: string): Client[] => {
  const clients = getClientsFromFile();
  return clients.filter((client) => client.AG === agentCode);
};
