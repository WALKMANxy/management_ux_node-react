import {
  GlobalPromos,
  GlobalVisits,
  MovementDetail,
  Promo,
  Visit,
} from "../models/dataModels";
import { serverClient, serverMovement } from "../models/dataSetTypes";

import { Admin, Agent, Client } from "../models/entityModels";

const workerScriptPath = new URL("./worker.js", import.meta.url);

// Mapping data to models including the new data types (Visits, Promos, Alerts)
export const mapDataToModels = async (
  data: serverMovement[],
  clientDetails: serverClient[],
  agentDetails: Agent[],
  visits: Visit[] = [],
  promos: Promo[] = []
): Promise<{ clients: Client[]; visits: Visit[]; promos: Promo[] }> => {
  const numWorkers = Math.min(navigator.hardwareConcurrency || 4, data.length);
  const chunkSize = Math.ceil(data.length / numWorkers);
  const chunks = Array.from({ length: numWorkers }, (_, i) =>
    data.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  const workers = chunks.map((chunk, index) => {
    return new Promise<Client[]>((resolve, reject) => {
      const worker = new Worker(workerScriptPath);

      worker.onmessage = (event: MessageEvent<Client[]>) => {
        resolve(event.data);
        worker.terminate(); // Terminate worker after it finishes
      };

      worker.onerror = (error) => {
        console.error(`Worker ${index} error:`, error);
        reject(error);
        worker.terminate(); // Terminate worker on error
      };

      worker.postMessage({
        data: chunk,
        clientDetails,
        agentDetails,
      });
    });
  });

  // Wait for all workers to complete
  const results = await Promise.all(workers);

  // Combine results from all workers
  const resultsMap = new Map<string, Client>();

  results.flat().forEach((client) => {
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

  // Convert the map back to an array
  const clients = Array.from(resultsMap.values());

  // Filtering visits, promos, and alerts based on client associations
  const filteredVisits = visits.filter((visit) =>
    clients.some((client) => client.id === visit.clientId)
  );
  const filteredPromos = promos.filter((promo) =>
    clients.some((client) => promo.clientsId.includes(client.id))
  );

  return {
    clients,
    visits: filteredVisits,
    promos: filteredPromos,
  };
};

// Mapping function for full agent data
export const mapDataToAgents = async (
  data: serverMovement[],
  agentDetails: Agent[],
  visits: Visit[] = [], // Default to an empty array if undefined
  promos: Promo[] = [] // Default to an empty array if undefined
): Promise<{ agents: Agent[]; visits: Visit[]; promos: Promo[] }> => {
  const agentsMap = new Map<string, Agent>();
  const aggregatedVisits: Visit[] = [];
  const aggregatedPromos: Promo[] = [];

  // Populate agents map from agentDetails
  agentDetails.forEach((agent) => {
    agentsMap.set(agent.id, {
      ...agent,
      clients: [],
    });
  });

  // Map clients to their respective agents and aggregate visits and promos
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
          agent: agentId,
          movements: [],
        };

        agent.clients.push(newClient);

        // Aggregate client's visits and promos into the aggregated data
        const clientVisits = visits.filter(
          (visit) => visit.clientId === clientId
        );
        const clientPromos = promos.filter((promo) =>
          promo.clientsId.includes(clientId)
        );

        aggregatedVisits.push(...clientVisits);
        aggregatedPromos.push(...clientPromos);
      }
    }
  });

  // Convert the map back to an array
  const agents = Array.from(agentsMap.values());

  // Returning agents, along with aggregated visits and promos
  return {
    agents,
    visits: aggregatedVisits,
    promos: aggregatedPromos,
  };
};

export const mapVisitsPromosToAdmin = (
  agents: Agent[],
  visits: Visit[],
  promos: Promo[]
): { globalVisits: GlobalVisits; globalPromos: GlobalPromos } => {
  const globalVisits: GlobalVisits = {};
  const globalPromos: GlobalPromos = {};

  agents.forEach((agent) => {
    globalVisits[agent.id] = {
      Visits: visits.filter((visit) =>
        agent.clients.some((client) => client.id === visit.clientId)
      ),
    };

    globalPromos[agent.id] = {
      Promos: promos.filter((promo) =>
        promo.clientsId.some((clientId) =>
          agent.clients.some((client) => client.id === clientId)
        )
      ),
    };
  });

  return { globalVisits, globalPromos };
};

// Mapping function for movement details
export const mapDataToMovementDetails = (
  data: serverMovement[]
): MovementDetail[] => {
  return data.map((item) => ({
    articleId: item["Codice Articolo"].toString(),
    name: item["Descrizione Articolo"],
    brand: item["Marca Articolo"],
    quantity: item["Quantita"],
    unitPrice: item["Prezzo Articolo"].toFixed(2),
    priceSold: item["Valore"].toFixed(2),
    priceBought: item["Costo"].toFixed(2),
  }));
};

// utils/dataLoader.ts

export const mapVisitsToEntity = (
  entity: Client | Agent | Admin,
  visits: Visit[],
  role: "client" | "agent" | "admin"
): Visit[] | GlobalVisits => {
  switch (role) {
    case "client":
      // For client, return a flat array of visits
      return visits.filter((visit) => visit.clientId === (entity as Client).id);

    case "agent":
      // For agent, return visits for all the agent's clients
      return (entity as Agent).clients.flatMap((client) =>
        visits.filter((visit) => visit.clientId === client.id)
      );

    case "admin": {
      const globalVisits: GlobalVisits = {};
      (entity as Admin).agents.forEach((agent) => {
        globalVisits[agent.id] = {
          Visits: agent.clients.flatMap((client) =>
            visits.filter((visit) => visit.clientId === client.id)
          ),
        };
      });
      return globalVisits;
    }

    default:
      throw new Error("Invalid user role");
  }
};

export const mapPromosToEntity = (
  entity: Client | Agent | Admin,
  promos: Promo[],
  role: "client" | "agent" | "admin"
): Promo[] | GlobalPromos => {
  switch (role) {
    case "client":
      // For client, return a flat array of promos
      return promos.filter((promo) =>
        promo.clientsId.includes((entity as Client).id)
      );

    case "agent":
      // For agent, return promos for all the agent's clients
      return (entity as Agent).clients.flatMap((client) =>
        promos.filter((promo) => promo.clientsId.includes(client.id))
      );

    case "admin": {
      // For admin, group promos by agent ID
      const globalPromos: GlobalPromos = {};
      (entity as Admin).agents.forEach((agent) => {
        globalPromos[agent.id] = {
          Promos: agent.clients.flatMap((client) =>
            promos.filter((promo) => promo.clientsId.includes(client.id))
          ),
        };
      });
      return globalPromos;
    }

    default:
      throw new Error("Invalid user role");
  }
};
