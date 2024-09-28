//src/services/agentService.ts
import { config } from "../config/config";
import { Agent } from "../models/types";
import { readFile, resolveFilePath, writeFile } from "../utils/fileUtils";

export const getAgentsFromFile = (): Agent[] => {
  const filePath = resolveFilePath(config.agentDetailsFilePath || "");
  return JSON.parse(readFile(filePath));
};

export const getAgentById = (id: string): Agent | undefined => {
  const agents = getAgentsFromFile();
  return agents.find((agent) => agent.id === id);
};

// Function to find an agent by a client's entity code
export const getAgentByClientEntityCode = (
  clientEntityCode: string
): Agent | undefined => {
  const agents = getAgentsFromFile();

  // Convert clientEntityCode to a string to ensure consistent comparison
  const entityCodeAsString = String(clientEntityCode);
 /*  console.log(
    "getAgentByClientEntityCode called with entityCode:",
    entityCodeAsString
  ); // Debugging */

  // Find the agent whose clients array contains the given clientEntityCode
  const agent = agents.find((agent) =>
    agent.clients.some((client) => {
      const clientCodeAsString = String(client.CODICE);
    /*   console.log(
        "Comparing client.CODICE:",
        clientCodeAsString,
        "with entityCode:",
        entityCodeAsString
      ); // Debugging */
      return clientCodeAsString === entityCodeAsString;
    })
  );

  if (agent) {
    // Filter the clients array to only include the client with the matching CODICE
    const filteredClients = agent.clients.filter(
      (client) => String(client.CODICE) === entityCodeAsString
    );

/*     console.log("Filtered clients for agent:", filteredClients); // Debugging
 */    return {
      ...agent,
      clients: filteredClients,
    };
  }

  console.warn(
    "No agent found with the given client entity code:",
    entityCodeAsString
  ); // Debugging
  return undefined; // Return undefined if no matching agent is found
};

export const updateAgentById = (
  id: string,
  updatedAgentData: Partial<Agent>
): Agent | null => {
  const agents = getAgentsFromFile();
  const agentIndex = agents.findIndex((agent) => agent.id === id);

  if (agentIndex === -1) {
    return null;
  }

  agents[agentIndex] = { ...agents[agentIndex], ...updatedAgentData };
  writeFile(resolveFilePath(config.agentDetailsFilePath || ""), agents);
  return agents[agentIndex];
};

export const replaceAgentById = (
  id: string,
  newAgentData: Agent
): Agent | null => {
  const agents = getAgentsFromFile();
  const agentIndex = agents.findIndex((agent) => agent.id === id);

  if (agentIndex === -1) {
    return null;
  }

  agents[agentIndex] = newAgentData;
  writeFile(resolveFilePath(config.agentDetailsFilePath || ""), agents);
  return agents[agentIndex];
};
