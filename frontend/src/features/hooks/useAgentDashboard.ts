import { useEffect, useState, useCallback, useMemo } from "react";
import { Client, Agent, Movement } from "../../models/models";
import { useGetClientsQuery } from "../../services/api";

const useAgentStats = (agentId: string | null) => {
  const { data: clientsData, isLoading, error } = useGetClientsQuery();
  const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clientIndex = useMemo(() => {
    if (clientsData) {
      return clientsData.reduce((acc, client) => {
        acc.set(client.id, client);
        return acc;
      }, new Map<string, Client>());
    }
    return new Map<string, Client>();
  }, [clientsData]);

  useEffect(() => {
    if (!isLoading && clientsData && agentId) {
      const agentClients = clientsData.filter(client => client.agent === agentId);
      const agent = { id: agentId, name: `Agent ${agentId}`, clients: agentClients };
      setAgentDetails(agent);
    }
  }, [isLoading, clientsData, agentId]);

  const calculateTotalSpentThisMonth = useCallback((movements: Movement[]) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return movements
      .filter(movement => {
        const movementDate = new Date(movement.dateOfOrder);
        return movementDate.getMonth() + 1 === currentMonth && movementDate.getFullYear() === currentYear;
      })
      .reduce((total, movement) => total + movement.details.reduce((sum, detail) => sum + parseFloat(detail.priceSold), 0), 0)
      .toFixed(2);
  }, []);

  const calculateTotalSpentThisYear = useCallback((movements: Movement[]) => {
    const currentYear = new Date().getFullYear();
    return movements
      .filter(movement => new Date(movement.dateOfOrder).getFullYear() === currentYear)
      .reduce((total, movement) => total + movement.details.reduce((sum, detail) => sum + parseFloat(detail.priceSold), 0), 0)
      .toFixed(2);
  }, []);

  const calculateTopArticleType = useCallback((movements: Movement[]) => {
    const typeCount: { [key: string]: number } = {};
    movements.forEach(movement => {
      movement.details.forEach(detail => {
        typeCount[detail.name] = (typeCount[detail.name] || 0) + 1;
      });
    });
    return Object.keys(typeCount).reduce((a, b) => (typeCount[a] > typeCount[b] ? a : b), "");
  }, []);

  const selectClient = useCallback((clientName: string) => {
    if (agentDetails) {
      const client = agentDetails.clients.find(client => client.name === clientName);
      if (client) {
        setSelectedClient(client);
      } else {
        console.error("Client not found for this agent");
      }
    }
  }, [agentDetails]);

  return {
    agentDetails,
    selectedClient,
    selectClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    isLoading,
    error,
  };
};

export default useAgentStats;
