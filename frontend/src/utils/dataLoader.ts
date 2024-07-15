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

export const mapDataToModels = async (
  data: any[],
  clientDetails: any[],
  agentDetails: any[]
): Promise<Client[]> => {
  const numWorkers = Math.min(navigator.hardwareConcurrency || 4, data.length);
  const chunkSize = Math.ceil(data.length / numWorkers);
  const chunks = Array.from({ length: numWorkers }, (_, i) =>
    data.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  return new Promise<Client[]>((resolve, reject) => {
    const workers: Worker[] = [];
    const resultsMap = new Map<string, Client>();
    let completed = 0;

    const handleWorkerMessage = (
      index: number,
      event: MessageEvent<Client[]>
    ) => {
      const workerResults = event.data;

      workerResults.forEach((client) => {
        if (resultsMap.has(client.id)) {
          const existingClient = resultsMap.get(client.id)!;
          existingClient.movements.push(...client.movements);
          existingClient.totalOrders += client.totalOrders;
          existingClient.totalRevenue = (
            parseFloat(existingClient.totalRevenue) +
            parseFloat(client.totalRevenue)
          ).toFixed(2);
        } else {
          resultsMap.set(client.id, client);
        }
      });

      completed += 1;
      workers[index].terminate();

      if (completed === workers.length) {
        const results = Array.from(resultsMap.values());
        resolve(results);
      }
    };

    const handleWorkerError = (index: number, error: ErrorEvent) => {
      console.error(`Worker ${index} error:`, error);
      workers.forEach((worker) => worker.terminate());
      reject(error);
    };

    chunks.forEach((chunk, index) => {
      const worker = new Worker(workerScriptPath);
      workers.push(worker);

      worker.onmessage = (event) => handleWorkerMessage(index, event);
      worker.onerror = (error) => handleWorkerError(index, error);

      worker.postMessage({ data: chunk, clientDetails, agentDetails });
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
    quantity: parseFloat(item["Quantita"]),
    unitPrice: parseFloat(item["Prezzo Articolo"]).toFixed(2),
    priceSold: parseFloat(item["Valore"]).toFixed(2),
    priceBought: parseFloat(item["Costo"]).toFixed(2),
  }));
};
