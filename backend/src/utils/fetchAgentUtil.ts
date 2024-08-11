import fs from 'fs';
import path from 'path';
import { Agent } from '../models/types'; // Adjust the import based on your project structure
import { config } from '../config/config';

// Utility function to fetch agents from the file
export const getAgentsFromFile = (): Agent[] => {
  const filePath = path.resolve(config.agentDetailsFilePath || "");
  const agents: Agent[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return agents;
};

// Utility function to get an agent by ID
export const getAgentById = (id: string): Agent | undefined => {
  const agents = getAgentsFromFile();
  return agents.find(agent => agent.id === id);
};
