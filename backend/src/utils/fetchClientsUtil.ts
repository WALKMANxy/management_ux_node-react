import fs from 'fs';
import path from 'path';
import { Client } from '../models/types'; // Adjust the import based on your project structure
import { config } from '../config/config';

// Utility function to fetch clients from the file
export const getClientsFromFile = (): Client[] => {
  const filePath = path.resolve(config.clientDetailsFilePath || "");
  const clients: Client[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return clients;
};

// Utility function to get a client by codice
export const getClientById = (codice: string): Client | undefined => {
  const clients = getClientsFromFile();
  return clients.find(client => client.CODICE === codice);
};
