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

): Promise<{ clients: Client[]; }> => {
  // Determine the number of workers based on hardware concurrency or default to 4
  const numWorkers = Math.min(navigator.hardwareConcurrency || 4, data.length);
  const chunkSize = Math.ceil(data.length / numWorkers);

  // Pre-process client details into a map for easy lookup
  const clientDetailsMap = new Map(
    clientDetails.map((detail) => [detail["CODICE"], detail])
  );

  // Split the data into chunks based on the number of workers
  const chunks = Array.from({ length: numWorkers }, (_, i) =>
    data.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  // Create workers and assign them relevant chunks of data with filtered client details
  const workers = chunks.map((chunk, index) => {
    // Filter client details that are relevant to the current chunk
    const relevantClientDetailsMap = Object.fromEntries(
      [...clientDetailsMap].filter(([clientId]) =>
        chunk.some((item) => item["Codice Cliente"].toString() === clientId)
      )
    );

    return new Promise<Client[]>((resolve, reject) => {
      const worker = new Worker(workerScriptPath);

      worker.onmessage = (event: MessageEvent<Client[]>) => {
        resolve(event.data);
        worker.terminate(); // Terminate the worker after it finishes
      };

      worker.onerror = (error) => {
        console.error(`Worker ${index} error:`, error);
        reject(error);
        worker.terminate(); // Terminate the worker on error
      };

      // Send the chunk of data and the relevant client details map
      worker.postMessage({
        data: chunk,
        clientDetailsMap: relevantClientDetailsMap, // Send only the relevant client details
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



  return {
    clients,

  };
};

// Mapping function for full agent data
export const mapDataToAgents = async (
  clients: Client[], // Accept clients already mapped with correct movements
  agentDetails: Agent[], // Array of agent details including clients' CODICE

): Promise<{ agents: Agent[]; }> => {
  const agentsMap = new Map<string, Agent>();


  // Populate agents map using agent details
  agentDetails.forEach((agentDetail) => {
    agentsMap.set(agentDetail.id, {
      ...agentDetail,
      clients: [], // Initialize with empty clients array
    });
  });

  // Map clients to their respective agents
  clients.forEach((client) => {
    const agent = agentsMap.get(client.agent); // Find the corresponding agent by id

    if (agent) {
      // Assign additional client properties like colour if available from agent details
      const clientDetailsFromAgent = agent.clients.find(
        (agentClient) => agentClient.id === client.id
      );

      // Update the client with additional properties from agentDetails if available
      client.colour = clientDetailsFromAgent
        ? clientDetailsFromAgent.colour
        : client.colour;

      // Add client to the corresponding agent's clients array
      agent.clients.push(client);


    }
  });

  // Convert the map back to an array of agents
  const agents = Array.from(agentsMap.values());

  return {
    agents,

  };
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
  visits: Visit[],
  entity: Client | Agent | Admin,
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
  promos: Promo[],
  entity: Client | Agent | Admin,
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
