import axios from "axios";
import { Client, Agent, MovementDetail } from "../models/models";
import { format, parseISO } from "date-fns"; // Import date-fns for date formatting

const jsonFilePath = "/datasetsfrom01JANto12JUN.json";
const clientDetailsFilePath = "/clientdetailsdataset02072024.json";

// Web worker script for clients
const workerScript = `
self.onmessage = function(event) {
  const { data, clientDetails } = event.data;

  const clientsMap = new Map();
  data.forEach(item => {
    const clientId = item["Codice Cliente"].toString();
    if (!clientsMap.has(clientId)) {
      clientsMap.set(clientId, []);
    }
    clientsMap.get(clientId).push(item);
  });

  const clients = Array.from(clientsMap.values()).map(clientData => {
    const clientInfo = clientData[0];

    const clientDetail = clientDetails.find(detail => detail["CODICE"] === clientInfo["Codice Cliente"].toString());

    if (clientDetail) {
      //console.log('Client Detail found:', clientDetail);
    } else {
      console.warn('Client Detail not found for:', clientInfo["Codice Cliente"]);
    }

    const movementsMap = new Map();
    clientData.forEach(item => {
      const movementId = item["Numero Lista"].toString();
      if (!movementsMap.has(movementId)) {
        movementsMap.set(movementId, []);
      }
      movementsMap.get(movementId).push(item);
    });

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

    const totalRevenue = movements.reduce((acc, movement) => {
      return acc + movement.details.reduce((sum, detail) => sum + parseFloat(detail.priceSold), 0);
    }, 0).toFixed(2);

    const client = {
      id: clientInfo["Codice Cliente"].toString(),
      name: clientInfo["Ragione Sociale Cliente"],
      province: clientDetail ? clientDetail["C.A.P. - COMUNE (PROV.)"] : "",
      phone: clientDetail ? clientDetail["TELEFONO"] : "",
      totalOrders: movementsMap.size,
      totalRevenue,
      unpaidRevenue: "",
      address: clientDetail ? clientDetail["INDIRIZZO"] : "",
      email: clientDetail ? clientDetail["EMAIL"] : "",
      pec: clientDetail ? clientDetail["EMAIL PEC"] : "",
      taxCode: clientDetail ? clientDetail["PARTITA IVA"] : "",
      extendedTaxCode: clientDetail ? clientDetail["CODICE FISCALE"] : "",
      paymentMethodID: clientDetail ? clientDetail["MP"] : "",
      paymentMethod: clientDetail ? clientDetail["Descizione metodo pagamento"] : "",
      visits: [],
      agent: clientInfo["Codice Agente"].toString(),
      movements,
      promos: []
    };

    //console.log('Processed client:', client);

    return client;
  });

  self.postMessage(clients);
};
`;

// Create a Blob URL for the worker script
const blob = new Blob([workerScript], { type: "application/javascript" });
const workerUrl = URL.createObjectURL(blob);

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

export const mapDataToModels = async (
  data: any[],
  clientDetails: any[]
): Promise<Client[]> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);

    //console.log('Sending data to worker:', { data, clientDetails });

    worker.postMessage({ data, clientDetails });

    worker.onmessage = function (event) {
      //console.log('Received data from worker:', event.data);
      resolve(event.data);
      worker.terminate();
    };

    worker.onerror = function (error) {
      console.error("Worker error:", error);
      reject(error);
      worker.terminate();
    };
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

// Calculate monthly data for a specific agent
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
