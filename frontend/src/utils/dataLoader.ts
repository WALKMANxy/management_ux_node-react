import {
  Agent,
  Alert,
  Client,
  MovementDetail,
  Promo,
  Visit,
} from "../models/models"; // Import the new types

const workerScriptPath = new URL("./worker.js", import.meta.url);

// Mapping data to models including the new data types (Visits, Promos, Alerts)
export const mapDataToModels = async (
  data: any[],
  clientDetails: any[],
  agentDetails: any[],
  visits: Visit[], // New parameter for visits
  promos: Promo[], // New parameter for promos
  alerts: Alert[] // New parameter for alerts
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

      worker.postMessage({
        data: chunk,
        clientDetails,
        agentDetails,
        visits,
        promos,
        alerts,
      }); // Include new data in the worker
    });
  });
};

// Mapping function for full agent data
export const mapDataToAgents = async (
  data: any[],
  agentDetails: Agent[],
  visits: Visit[],
  promos: Promo[],
  alerts: Alert[]
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
            (alert) => alert.entityRole === "client" && alert.entityCode === clientId
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
