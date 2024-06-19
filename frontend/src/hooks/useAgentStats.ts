// src/hooks/useAgentStats.ts
import { useEffect, useState } from 'react';
import { Client, Agent, Movement } from '../models/models';
import mockData from '../mockData/mockData';

const useAgentStats = (agentId: string | null) => {
  const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    console.log('Fetching agent details for:', agentId);
    const agent = mockData.agents.find(agent => agent.id === agentId);
    if (agent) {
      setAgentDetails(agent);
    } else {
      console.error('Agent not found');
    }
  }, [agentId]);

  const calculateTotalSpentThisMonth = (movements: Movement[]) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return movements
      .filter(movement => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      })
      .reduce((total, movement) => total + parseFloat(movement.price), 0);
  };

  const calculateTotalSpentThisYear = (movements: Movement[]) => {
    const currentYear = new Date().getFullYear();
    return movements
      .filter(movement => new Date(movement.dateOfOrder).getFullYear() === currentYear)
      .reduce((total, movement) => total + parseFloat(movement.price), 0);
  };

  const calculateTopArticleType = (movements: Movement[]) => {
    const typeCount: { [key: string]: number } = {};
    movements.forEach(movement => {
      if (typeCount[movement.type]) {
        typeCount[movement.type]++;
      } else {
        typeCount[movement.type] = 1;
      }
    });
    return Object.keys(typeCount).reduce((a, b) => (typeCount[a] > typeCount[b] ? a : b), '');
  };

  const selectClient = (clientId: string) => {
    console.log('Selecting client:', clientId);
    const client = agentDetails?.clients.find(client => client.id === clientId);
    if (client) {
      setSelectedClient(client);
    } else {
      console.error('Client not found for this agent');
    }
  };

  return {
    agentDetails,
    selectedClient,
    selectClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
  };
};

export default useAgentStats;
