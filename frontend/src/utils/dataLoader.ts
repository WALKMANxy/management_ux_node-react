// utils/dataLoader.ts
import axios from 'axios';
import { Client, Agent, MovementDetail } from '../models/models';
import { format, parseISO } from "date-fns"; // Import date-fns for date formatting

const jsonFilePath = '/datasetsfrom01JANto12JUN.json';

// Web worker script for clients
const workerScript = `
self.onmessage = function(event) {
  const { data, chunkSize } = event.data;
  
  // Create a clientsMap using reduce
  const clientsMap = data.reduce((map, item) => {
    const clientId = item["Codice Cliente"].toString();
    if (!map.has(clientId)) {
      map.set(clientId, []);
    }
    map.get(clientId).push(item);
    return map;
  }, new Map());

  // Map the clients data
  const clients = Array.from(clientsMap.values()).map(clientData => {
    const clientInfo = clientData[0];

    // Create a movementsMap using reduce
    const movementsMap = clientData.reduce((map, item) => {
      const movementId = item["Numero Lista"].toString();
      if (!map.has(movementId)) {
        map.set(movementId, []);
      }
      map.get(movementId).push(item);
      return map;
    }, new Map());

    // Map the movements data
    const movements = Array.from(movementsMap.values()).map(movementData => {
      const movementInfo = movementData[0];
      return {
        id: movementInfo["Numero Lista"].toString(),
        discountCategory: movementInfo["Categoria Sconto Vendita"],
        details: movementData.map(item => ({
          articleId: item["Codice Articolo"].toString(),
          name: item["Descrizione Articolo"],
          brand: item["Marca Articolo"],
          priceSold: parseFloat(item["Valore"]).toFixed(2),
          priceBought: parseFloat(item["Costo"]).toFixed(2)
        })),
        unpaidAmount: "",
        paymentDueDate: "",
        dateOfOrder: movementInfo["Data Documento Precedente"].split('T')[0]
      };
    });

    // Calculate the total revenue using reduce
    const totalRevenue = movements.reduce((acc, movement) => {
      return acc + movement.details.reduce((sum, detail) => sum + parseFloat(detail.priceSold), 0);
    }, 0).toFixed(2);

    // Return the mapped client object
    return {
      id: clientInfo["Codice Cliente"].toString(),
      name: clientInfo["Ragione Sociale Cliente"],
      province: "",
      phone: "",
      totalOrders: movementsMap.size,
      totalRevenue,
      unpaidRevenue: "",
      address: "",
      email: "",
      visits: [],
      agent: clientInfo["Codice Agente"].toString(),
      movements,
      promos: []
    };
  });

  self.postMessage(clients);
};
`;

// Create a Blob URL for the worker script
const blob = new Blob([workerScript], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);

const getMonthYear = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, "yyyy-MM");
};


export const loadJsonData = async (url: string = jsonFilePath): Promise<any[]> => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error loading JSON data:', error);
    throw new Error(`Failed to load data from ${url}`);
  }
};

export const mapDataToModels = (data: any[]): Promise<Client[]> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);
    const chunkSize = 1000;

    worker.postMessage({ data, chunkSize });

    worker.onmessage = function(event) {
      resolve(event.data);
      worker.terminate();
    };

    worker.onerror = function(error) {
      reject(error);
      worker.terminate();
    };
  });
};

export const mapDataToClients = (data: any[]): Promise<Client[]> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);
    const chunkSize = 1000;

    worker.postMessage({ data, chunkSize });

    worker.onmessage = function(event) {
      resolve(event.data);
      worker.terminate();
    };

    worker.onerror = function(error) {
      reject(error);
      worker.terminate();
    };
  });
};

export const mapDataToMinimalClients = (data: any[]): Client[] => {
  const clientsMap = data.reduce<Map<string, any>>((acc, item) => {
    const clientId = item["Codice Cliente"].toString();
    if (!acc.has(clientId)) {
      acc.set(clientId, { id: clientId, name: item["Ragione Sociale Cliente"] });
    }
    return acc;
  }, new Map<string, any>());

  return Array.from(clientsMap.values());
};

export const mapDataToMinimalAgents = (data: any[]): Agent[] => {
  const agentsMap = data.reduce<Map<string, any>>((acc, item) => {
    const agentId = item["Codice Agente"].toString();
    if (!acc.has(agentId)) {
      acc.set(agentId, { id: agentId, name: `Agent ${agentId}`, clients: [] });
    }
    return acc;
  }, new Map<string, any>());

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
    clients: clientData.map(item => ({
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
      promos: []
    }))
  }));

  return agents;
}



export const mapDataToMovementDetails = (data: any[]): MovementDetail[] => {
  return data.map(item => ({
    articleId: item["Codice Articolo"].toString(),
    name: item["Descrizione Articolo"],
    brand: item["Marca Articolo"],
    priceSold: parseFloat(item["Valore"]).toFixed(2),
    priceBought: parseFloat(item["Costo"]).toFixed(2)
  }));
};

export const calculateMonthlyRevenue = (clients: Client[]) => {
  const monthlyRevenue = clients.reduce((acc, client) => {
    client.movements.forEach((movement) => {
      const monthYear = getMonthYear(movement.dateOfOrder);
      if (monthYear === 'Invalid Date') {
        console.error('Skipping movement with invalid date:', movement);
        return;
      }
      const movementRevenue = movement.details.reduce(
        (sum, detail) => sum + parseFloat(detail.priceSold),
        0
      );
      acc[monthYear] = (acc[monthYear] || 0) + movementRevenue;
    });
    return acc;
  }, {} as { [key: string]: number });

  const months = Object.keys(monthlyRevenue).sort();
  const revenueData = months.map((month) => monthlyRevenue[month]);

  console.log("Months:", months);
  console.log("Revenue Data:", revenueData);

  return { months, revenueData };
};
