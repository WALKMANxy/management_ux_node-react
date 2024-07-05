import axios from "axios";
import { format, parseISO } from "date-fns";
import { Agent, Client, MovementDetail } from "../models/models";

const jsonFilePath = "/datasetsfrom01JANto12JUN.min.json";
const clientDetailsFilePath = "/clientdetailsdataset02072024.min.json";

const workerScriptPath = new URL("./worker.js", import.meta.url);

const getMonthYear = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, "yyyy-MM");
};

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
  clientDetails: any[]
): Promise<Client[]> => {
  const numWorkers = Math.min(navigator.hardwareConcurrency || 4, 4); // Limit to a maximum of 4 workers
  const chunks = chunkArray(data, Math.ceil(data.length / numWorkers));

  return new Promise<Client[]>((resolve, reject) => {
    const workers: Worker[] = chunks.map(
      (chunk) => new Worker(workerScriptPath)
    );
    const results: Client[] = [];
    let completed = 0;

    workers.forEach((worker, index) => {
      worker.postMessage({ data: chunks[index], clientDetails });

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

export const mapDataToAgents = (data: any[]): Agent[] => {
  const agentsMap = data.reduce<Map<string, any[]>>((acc, item) => {
    const agentId = item["Codice Agente"].toString();
    acc.set(agentId, (acc.get(agentId) || []).concat(item));
    return acc;
  }, new Map<string, any[]>());

  const agents = Array.from(agentsMap.entries()).map(([id, clientData]) => ({
    id,
    name: `Agent ${id}`,
    clients: clientData.map((item) => ({
      id: item["Codice Cliente"].toString(),
      name: item["Ragione Sociale Cliente"],
      province: "",
      phone: "",
      totalOrders: 0, // Placeholder
      totalRevenue: "0", // Placeholder
      unpaidRevenue: "0", // Placeholder
      address: "",
      email: "",
      visits: [],
      agent: id,
      movements: [],
      promos: [],
    })),
  }));

  return agents;
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

export const calculateMonthlyData = (clients: Client[]) => {
  const monthlyData = clients.reduce((acc, client) => {
    client.movements.forEach((movement) => {
      const monthYear = getMonthYear(movement.dateOfOrder);
      if (monthYear === "Invalid Date") {
        console.error("Skipping movement with invalid date:", movement);
        return;
      }
      const movementRevenue = movement.details.reduce(
        (sum, detail) => sum + parseFloat(detail.priceSold),
        0
      );
      const movementOrders = movement.details.length;
      if (!acc[monthYear]) {
        acc[monthYear] = { revenue: 0, orders: 0 };
      }
      acc[monthYear].revenue += movementRevenue;
      acc[monthYear].orders += movementOrders;
    });
    return acc;
  }, {} as { [key: string]: { revenue: number; orders: number } });

  const months = Object.keys(monthlyData).sort();
  const revenueData = months.map((month) => monthlyData[month].revenue);
  const ordersData = months.map((month) => monthlyData[month].orders);

  return { months, revenueData, ordersData };
};

export const calculateAgentMonthlyData = (clients: Client[]) => {
  const monthlyData = clients.reduce((acc, client) => {
    client.movements.forEach((movement) => {
      const monthYear = getMonthYear(movement.dateOfOrder);
      if (monthYear === "Invalid Date") {
        console.error("Skipping movement with invalid date:", movement);
        return;
      }
      const movementRevenue = movement.details.reduce(
        (sum, detail) => sum + parseFloat(detail.priceSold),
        0
      );
      const movementOrders = 1; // Each movement is an order
      if (!acc[monthYear]) {
        acc[monthYear] = { revenue: 0, orders: 0 };
      }
      acc[monthYear].revenue += movementRevenue;
      acc[monthYear].orders += movementOrders;
    });
    return acc;
  }, {} as { [key: string]: { revenue: number; orders: number } });

  const months = Object.keys(monthlyData).sort();
  const revenueData = months.map((month) => monthlyData[month].revenue);
  const ordersData = months.map((month) => monthlyData[month].orders);

  return { months, revenueData, ordersData };
};
