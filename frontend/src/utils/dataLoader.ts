import axios from "axios";
import { Agent, Client, MovementDetail } from "../models/models";

const jsonFilePath = "/data/datasetsfrom01JANto12JUN.min.json";
const clientDetailsFilePath = "/data/clientdetailsdataset02072024.min.json";
const agentDetailsFilePath = "/data/agentdetailsdataset02072024.min.json";

const workerScriptPath = new URL("./worker.js", import.meta.url);

export const loadJsonData = async (
  url: string = jsonFilePath
): Promise<any[]> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error loading JSON data:", error);
    throw new Error(`Failed to load data from ${url}`);
  }
};

export const loadClientDetailsData = async (
  url: string = clientDetailsFilePath
): Promise<any[]> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error loading client details data:", error);
    throw new Error(`Failed to load data from ${url}`);
  }
};

export const loadAgentDetailsData = async (
  url: string = agentDetailsFilePath
): Promise<Agent[]> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error loading agent details data:", error);
    throw new Error(`Failed to load data from ${url}`);
  }
};

/**
 * Chunks an array into smaller arrays of a specified size.
 * @param {Array<T>} array - The array to be chunked.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Array<Array<T>>} - An array of arrays, where each inner array
 * contains `chunkSize` elements from the original array.
 */
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Maps the given data and client details to a list of Client models.
 *
 * @param data - The data to map, typed as an array of any.
 * @param clientDetails - The client details to map, typed as an array of any.
 * @returns A Promise that resolves to an array of Client models.
 */
export const mapDataToModels = async (
  data: any[],
  clientDetails: any[],
  agentDetails: any[]
): Promise<Client[]> => {
  const numWorkers = Math.min(navigator.hardwareConcurrency || 4, 4);
  const chunks = chunkArray(data, Math.ceil(data.length / numWorkers));

  return new Promise<Client[]>((resolve, reject) => {
    const workers: Worker[] = chunks.map(
      (chunk) => new Worker(workerScriptPath)
    );
    const results: Client[] = [];
    let completed = 0;

    workers.forEach((worker, index) => {
      console.log("Sending data to worker:", { data: chunks[index], clientDetails, agentDetails });
      worker.postMessage({ data: chunks[index], clientDetails, agentDetails });

      worker.onmessage = (event: MessageEvent<Client[]>) => {
        results.push(...event.data);
        completed += 1;
        worker.terminate();

        if (completed === workers.length) {
          resolve(results);
        }
      };

      worker.onerror = (error: ErrorEvent) => {
        console.error("Worker error:", error);
        reject(error);
        worker.terminate();
      };
    });
  });
};

export const mapDataToMinimalClients = (data: any[]): Client[] => {
  const clientsMap = new Map<string, any>();
  data.forEach((item) => {
    const clientId = item["Codice Cliente"].toString();
    if (!clientsMap.has(clientId)) {
      clientsMap.set(clientId, {
        id: clientId,
        name: item["Ragione Sociale Cliente"],
      });
    }
  });

  return Array.from(clientsMap.values());
};

export const mapDataToMinimalAgents = (data: any[]): Agent[] => {
  const agentsMap = new Map<string, any>();
  data.forEach((item) => {
    const agentId = item["Codice Agente"].toString();
    if (!agentsMap.has(agentId)) {
      agentsMap.set(agentId, {
        id: agentId,
        name: `Agent ${agentId}`,
        clients: [],
      });
    }
  });

  return Array.from(agentsMap.values());
};

/**
 * Maps the given data to a list of Agent models.
 *
 * @param data - The data to map, typed as an array of any.
 * @param agentDetails - The agent details to map, typed as an array of any.
 * @returns A Promise that resolves to an array of Agent models.
 */
export const mapDataToAgents = async (
  data: any[],
  agentDetails: Agent[]
): Promise<Agent[]> => {
  const agentsMap = new Map<string, Agent>();

  // Populate agents map from agentDetails
  agentDetails.forEach((agent) => {
    agentsMap.set(agent.id, {
      ...agent,
      clients: [],
      AgentVisits: [], // Initialize AgentVisits
      AgentPromos: [], // Initialize AgentPromos
    });
  });

  // Map clients and their visits/promos to their respective agents
  data.forEach((item) => {
    const agentId = item["Codice Agente"].toString();
    const clientId = item["Codice Cliente"].toString();
    const agent = agentsMap.get(agentId);

    if (agent) {
      const existingClient = agent.clients.find(
        (client) => client.id === clientId
      );
      if (!existingClient) {
        const newClient: Client = {
          id: clientId,
          name: item["Ragione Sociale Cliente"],
          province: "",
          phone: "",
          totalOrders: 0,
          totalRevenue: "0",
          unpaidRevenue: "0",
          address: "",
          email: "",
          visits: [],
          agent: agentId,
          movements: [],
          promos: [],
        };
        agent.clients.push(newClient);
        agent.AgentVisits.push(...newClient.visits);
        agent.AgentPromos.push(...newClient.promos);
      }
    }
  });

  return Array.from(agentsMap.values());
};

export const mapDataToMovementDetails = (data: any[]): MovementDetail[] => {
  return data.map((item) => ({
    articleId: item["Codice Articolo"].toString(),
    name: item["Descrizione Articolo"],
    brand: item["Marca Articolo"],
    priceSold: parseFloat(item["Valore"]).toFixed(2),
    priceBought: parseFloat(item["Costo"]).toFixed(2),
  }));
};

export const mapDataToAdmin = (
  data: any[],
  agentDetails: Agent[],
  clientDetails: any[]
): { agents: Agent[]; clients: Client[] } => {
  const agentsMap = new Map<string, Agent>();
  const clientsMap = new Map<string, Client>();

  agentDetails.forEach((agent) => {
    agentsMap.set(agent.id, {
      ...agent,
      clients: [],
      alerts: [],
      AgentVisits: [], // Initialize AgentVisits
      AgentPromos: [], // Initialize AgentPromos
    });
  });

  data.forEach((item) => {
    const agentId = item["Codice Agente"].toString();
    const clientId = item["Codice Cliente"].toString();

    if (!agentsMap.has(agentId)) {
      agentsMap.set(agentId, {
        id: agentId,
        name: `Agent ${agentId}`,
        clients: [],
        alerts: [],
        AgentVisits: [],
        AgentPromos: [],
      });
    }

    const clientDetail = clientDetails.find(detail => detail.CODICE === clientId);

    if (!clientsMap.has(clientId)) {
      clientsMap.set(clientId, {
        id: clientId,
        name: item["Ragione Sociale Cliente"],
        province: clientDetail ? clientDetail["C.A.P. - COMUNE (PROV.)"] : "",
        phone: clientDetail ? clientDetail["TELEFONO"] : "",
        totalOrders: 0,
        totalRevenue: "0",
        unpaidRevenue: "0",
        address: clientDetail ? clientDetail["INDIRIZZO"] : "",
        email: clientDetail ? clientDetail["EMAIL"] : "",
        visits: [],
        agent: agentId,
        movements: [],
        promos: [],
      });
    }

    const agent = agentsMap.get(agentId)!;
    const client = clientsMap.get(clientId)!;

    if (!agent.clients.find((c) => c.id === client.id)) {
      agent.clients.push(client);
      agent.AgentVisits.push(...client.visits);
      agent.AgentPromos.push(...client.promos);
    }
  });

  // Merge agent details to ensure the correct names are assigned
  agentDetails.forEach((agentDetail) => {
    const agent = agentsMap.get(agentDetail.id);
    if (agent) {
      agent.name = agentDetail.name;
      agent.email = agentDetail.email;
      agent.phone = agentDetail.phone;
    }
  });

  const mappedAgents = Array.from(agentsMap.values());
  const mappedClients = Array.from(clientsMap.values());

  console.log("Mapped agents:", mappedAgents);
  console.log("Mapped clients:", mappedClients);

  return {
    agents: mappedAgents,
    clients: mappedClients,
  };
};
