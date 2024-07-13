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
  const numWorkers = navigator.hardwareConcurrency || 4;
  const chunks = chunkArray(data, Math.ceil(data.length / numWorkers));

  return new Promise<Client[]>((resolve, reject) => {
    const workers: Worker[] = chunks.map(
      (chunk) => new Worker(workerScriptPath)
    );
    const resultsMap = new Map<string, Client>();
    let completed = 0;

    workers.forEach((worker, index) => {
      console.log(`Sending data to worker ${index}:`, { data: chunks[index], clientDetails, agentDetails });
      worker.postMessage({ data: chunks[index], clientDetails, agentDetails });

      worker.onmessage = (event: MessageEvent<Client[]>) => {
        console.log(`Worker ${index} finished processing.`);
        const workerResults = event.data;
        
        workerResults.forEach((client) => {
          if (resultsMap.has(client.id)) {
            const existingClient = resultsMap.get(client.id)!; // Non-null assertion operator
            // Merge movements
            existingClient.movements.push(...client.movements);
            // Update totalOrders
            existingClient.totalOrders += client.totalOrders;
            // Update totalRevenue
            existingClient.totalRevenue = (parseFloat(existingClient.totalRevenue) + parseFloat(client.totalRevenue)).toFixed(2);
          } else {
            resultsMap.set(client.id, client);
          }
        });

        completed += 1;
        worker.terminate();

        if (completed === workers.length) {
          const results = Array.from(resultsMap.values());
          console.log('All workers finished. Aggregated results:', results);
          resolve(results);
        }
      };

      worker.onerror = (error: ErrorEvent) => {
        console.error(`Worker ${index} error:`, error);
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
    quantity: parseFloat(item["Quantita"]),
    unitPrice: parseFloat(item["Prezzo Articolo"]).toFixed(2),
    priceSold: parseFloat(item["Valore"]).toFixed(2),
    priceBought: parseFloat(item["Costo"]).toFixed(2),
  }));
};
