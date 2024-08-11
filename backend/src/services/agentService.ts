import { Agent } from '../models/types';
import { readFile, writeFile, resolveFilePath } from '../utils/fileUtils';
import { config } from '../config/config';

export const getAgentsFromFile = (): Agent[] => {
  const filePath = resolveFilePath(config.agentDetailsFilePath || "");
  return JSON.parse(readFile(filePath));
};

export const getAgentById = (id: string): Agent | undefined => {
  const agents = getAgentsFromFile();
  return agents.find(agent => agent.id === id);
};

export const updateAgentById = (id: string, updatedAgentData: Partial<Agent>): Agent | null => {
  const agents = getAgentsFromFile();
  const agentIndex = agents.findIndex(agent => agent.id === id);

  if (agentIndex === -1) {
    return null;
  }

  agents[agentIndex] = { ...agents[agentIndex], ...updatedAgentData };
  writeFile(resolveFilePath(config.agentDetailsFilePath || ""), agents);
  return agents[agentIndex];
};

export const replaceAgentById = (id: string, newAgentData: Agent): Agent | null => {
  const agents = getAgentsFromFile();
  const agentIndex = agents.findIndex(agent => agent.id === id);

  if (agentIndex === -1) {
    return null;
  }

  agents[agentIndex] = newAgentData;
  writeFile(resolveFilePath(config.agentDetailsFilePath || ""), agents);
  return agents[agentIndex];
};
