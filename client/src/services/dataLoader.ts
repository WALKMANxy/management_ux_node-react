// client/src/services/dataLoader.ts
import dayjs from "dayjs";
import {
  CalendarEvent,
  GlobalVisits,
  MovementDetail,
  Promo,
  Visit,
} from "../models/dataModels";
import { serverClient, serverMovement } from "../models/dataSetTypes";

import { Admin, Agent, Client } from "../models/entityModels";

const workerScriptPath = new URL("../workers/worker.js", import.meta.url);
// Mapping data to models including the new data types (Visits, Promos, Alerts)
export const mapDataToModels = async (
  data: serverMovement[],
  clientDetails: serverClient[]
): Promise<{ clients: Client[] }> => {
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
    const relevantClientIds = new Set(
      chunk.map((item) => item["Codice Cliente"].toString())
    );

    const relevantClientDetailsMap = new Map(
      [...clientDetailsMap].filter(([clientId]) =>
        relevantClientIds.has(clientId)
      )
    );

    return new Promise<Client[]>((resolve, reject) => {
      const worker = new Worker(workerScriptPath);

      worker.onmessage = (event: MessageEvent<Client[]>) => {
        resolve(event.data);
        worker.terminate();
      };

      worker.onerror = (error) => {
        console.error(`Worker ${index} error:`, error);
        reject(error);
        worker.terminate();
      };

      // Send the chunk of data and the relevant client details map
      worker.postMessage({
        data: chunk,
        clientDetailsMap: Object.fromEntries(relevantClientDetailsMap),
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

  return {
    clients: Array.from(resultsMap.values()),
  };
};

// Mapping function for full agent data
export const mapDataToAgents = async (
  clients: Client[],
  agentDetails: Agent[]
): Promise<{ agents: Agent[] }> => {
  const agentsMap = new Map<string, Agent>(
    agentDetails.map((agent) => [agent.id, { ...agent, clients: [] }])
  );

  clients.forEach((client) => {
    const agent = agentsMap.get(client.agent);
    if (agent) {
      agent.clients.push(client);
    }
  });

  return {
    agents: Array.from(agentsMap.values()),
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

export const mapVisitsToEntity = (
  visits: Visit[],
  entity: Client | Agent | Admin,
  role: "client" | "agent" | "admin"
): Visit[] | GlobalVisits => {
  switch (role) {
    case "client":
      return visits.filter((visit) => visit.clientId === (entity as Client).id);

    case "agent": {
      const clientIds = new Set((entity as Agent).clients.map((c) => c.id));
      return visits.filter((visit) => clientIds.has(visit.clientId));
    }

    case "admin": {
      const globalVisits: GlobalVisits = {};
      const admin = entity as Admin;
      admin.agents.forEach((agent) => {
        globalVisits[agent.id] = {
          Visits: visits.filter((visit) =>
            agent.clients.some((client) => client.id === visit.clientId)
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
): Promo[] => {
  const today = dayjs();

  switch (role) {
    case "client":
      return promos.filter((promo) => {
        if (dayjs(promo.endDate).isBefore(today)) return false;
        if (
          promo.global &&
          !promo.excludedClientsId?.includes((entity as Client).id)
        ) {
          return true;
        }
        return promo.clientsId?.includes((entity as Client).id) || false;
      });

    case "agent": {
      const agentClientIds = new Set(
        (entity as Agent).clients.map((c) => c.id)
      );
      return promos.filter((promo) => {
        if (promo.global) return true;
        return promo.clientsId?.some((id) => agentClientIds.has(id)) || false;
      });
    }

    case "admin":
      return promos;

    default:
      throw new Error("Invalid user role");
  }
};

// Function to map a Visit to a CalendarEvent
export const mapVisitToCalendarEvent = (visit: Visit): CalendarEvent => {
  const date = new Date(visit.date);
  const createdAt = new Date(visit.createdAt);

  return {
    _id: visit._id,
    userId: visit.visitIssuedBy,
    startDate: date,
    endDate: date,
    eventType: "visit",
    eventName: `Visit for ${visit.clientId}`,
    reason: visit.visitReason as CalendarEvent["reason"],
    note: visit.notePublic,
    status: visit.pending
      ? "pending"
      : visit.completed
      ? "approved"
      : "pending",
    createdAt,
    updatedAt: new Date(),
  };
};
