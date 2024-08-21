import { Alert, MovementDetail, Promo, Visit } from "../models/dataModels";

import { Admin, Agent, Client } from "../models/entityModels";

const workerScriptPath = new URL("./worker.js", import.meta.url);

// Mapping data to models including the new data types (Visits, Promos, Alerts)
export const mapDataToModels = async (
  data: any[],
  clientDetails: any[],
  agentDetails: any[],
  visits: Visit[] = [],
  promos: Promo[] = [],
  alerts: Alert[] = []
): Promise<Client[]> => {
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
        visits,
        promos,
        alerts,
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

  return Array.from(resultsMap.values());
};

// Mapping function for full agent data
export const mapDataToAgents = async (
  data: any[],
  agentDetails: Agent[],
  visits: Visit[] = [], // Default to an empty array if undefined
  promos: Promo[] = [], // Default to an empty array if undefined
  alerts: Alert[] = [] // Default to an empty array if undefined
): Promise<Agent[]> => {
  const agentsMap = new Map<string, Agent>();

  // Populate agents map from agentDetails
  agentDetails.forEach((agent) => {
    agentsMap.set(agent.id, {
      ...agent,
      clients: [],
      AgentVisits: [],
      AgentPromos: [],
      agentAlerts: [],
    });
  });

  // Map clients and their visits/promos/alerts to their respective agents
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
          visits: visits.filter((visit) => visit.clientId === clientId),
          agent: agentId,
          movements: [],
          promos: promos.filter((promo) => promo.clientsId.includes(clientId)),
          clientAlerts: alerts.filter(
            (alert) =>
              alert.entityRole === "client" && alert.entityCode === clientId
          ),
        };
        agent.clients.push(newClient);

        // Aggregate client's visits and promos into the agent's data
        agent.AgentVisits.push(...newClient.visits);
        agent.AgentPromos.push(...newClient.promos);
      }
    }
  });

  // Map agent-level alerts
  agentsMap.forEach((agent) => {
    agent.agentAlerts = alerts.filter(
      (alert) => alert.entityRole === "agent" && alert.entityCode === agent.id
    );
  });

  return Array.from(agentsMap.values());
};

// Mapping function for movement details
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

// utils/dataLoader.ts

export const mapVisitsToEntity = <T extends Client | Agent | Admin>(
  entity: T,
  visits: Visit[]
) => {
  if ((entity as Client).id) {
    // Client
    (entity as Client).visits = visits.filter(
      (visit) => visit.clientId === (entity as Client).id
    );
  } else if ((entity as Agent).id) {
    // Agent
    const agent = entity as Agent;
    agent.AgentVisits = agent.clients.flatMap((client) =>
      visits.filter((visit) => visit.clientId === client.id)
    );
  } else if ((entity as Admin).id) {
    // Admin
    const admin = entity as Admin;
    admin.agents.forEach((agent) => {
      agent.AgentVisits = agent.clients.flatMap((client) =>
        visits.filter((visit) => visit.clientId === client.id)
      );
    });
    admin.GlobalVisits = {};
    admin.agents.forEach((agent) => {
      admin.GlobalVisits[agent.id] = {
        Visits: agent.AgentVisits || [],
      };
    });
  }
};

export const mapPromosToEntity = <T extends Client | Agent | Admin>(
  entity: T,
  promos: Promo[]
) => {
  if ((entity as Client).id) {
    // Client
    (entity as Client).promos = promos.filter((promo) =>
      promo.clientsId.includes((entity as Client).id)
    );
  } else if ((entity as Agent).id) {
    // Agent
    const agent = entity as Agent;
    agent.AgentPromos = agent.clients.flatMap((client) =>
      promos.filter((promo) => promo.clientsId.includes(client.id))
    );
  } else if ((entity as Admin).id) {
    // Admin
    const admin = entity as Admin;
    admin.agents.forEach((agent) => {
      agent.AgentPromos = agent.clients.flatMap((client) =>
        promos.filter((promo) => promo.clientsId.includes(client.id))
      );
    });
    admin.GlobalPromos = {};
    admin.agents.forEach((agent) => {
      admin.GlobalPromos[agent.id] = {
        Promos: agent.AgentPromos || [],
      };
    });
  }
};
