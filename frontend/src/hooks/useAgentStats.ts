// src/hooks/useAgentStats.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { Client, Agent, Movement } from "../models/models";
import { useGetClientsQuery } from "../services/api";
import { calculateAgentMonthlyData } from "../utils/dataLoader";
import {
  calculateAgentTotalRevenue,
  calculateAgentTotalOrders,
  calculateAgentTopBrandsData,
  calculateAgentSalesDistributionData,
} from "../utils/dataUtils";

const useAgentStats = (agentId: string | null, isMobile: boolean) => {
  const { data: clientsData, isLoading, error } = useGetClientsQuery();
  const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!isLoading && clientsData && agentId) {
      const agentClients = clientsData.filter(
        (client) => client.agent === agentId
      );
      const agent = {
        id: agentId,
        name: `Agent ${agentId}`,
        clients: agentClients,
      };
      setAgentDetails(agent);
    }
  }, [isLoading, clientsData, agentId]);

  const calculateTotalSpentThisMonth = useCallback((movements: Movement[]) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const totalSpent = movements
      .filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      })
      .reduce(
        (total, movement) =>
          total +
          movement.details.reduce(
            (sum, detail) => sum + parseFloat(detail.priceSold),
            0
          ),
        0
      )
      .toFixed(2);
    return totalSpent;
  }, []);

  const calculateTotalSpentThisYear = useCallback((movements: Movement[]) => {
    const currentYear = new Date().getFullYear();
    return movements
      .filter(
        (movement) =>
          new Date(movement.dateOfOrder).getFullYear() === currentYear
      )
      .reduce(
        (total, movement) =>
          total +
          movement.details.reduce(
            (sum, detail) => sum + parseFloat(detail.priceSold),
            0
          ),
        0
      )
      .toFixed(2);
  }, []);

  const calculateTopArticleType = useCallback((movements: Movement[]) => {
    const typeCount: {
      [key: string]: { id: string; name: string; amount: number };
    } = {};
    movements.forEach((movement) => {
      movement.details.forEach((detail) => {
        if (!typeCount[detail.name]) {
          typeCount[detail.name] = {
            id: detail.articleId,
            name: detail.name,
            amount: 0,
          };
        }
        typeCount[detail.name].amount += 1;
      });
    });
    const sortedArticles = Object.values(typeCount).sort(
      (a, b) => b.amount - a.amount
    );
    return sortedArticles.slice(0, 5); // Return top 5 articles
  }, []);

  const selectClient = useCallback(
    (clientName: string) => {
      if (agentDetails) {
        if (clientName === "") {
          setSelectedClient(null);
          return;
        }
        const client = agentDetails.clients.find(
          (client) => client.name === clientName
        );
        if (client) {
          setSelectedClient(client);
        } else {
          console.error("Client not found for this agent");
        }
      }
    },
    [agentDetails]
  );

  const totalRevenue = useMemo(
    () =>
      agentDetails
        ? parseFloat(calculateAgentTotalRevenue(agentDetails.clients))
        : 0,
    [agentDetails]
  );

  const totalOrders = useMemo(
    () => (agentDetails ? calculateAgentTotalOrders(agentDetails.clients) : 0),
    [agentDetails]
  );

  const topBrandsData = useMemo(
    () =>
      agentDetails ? calculateAgentTopBrandsData(agentDetails.clients) : [],
    [agentDetails]
  );

  const salesDistributionData = useMemo(
    () =>
      agentDetails
        ? calculateAgentSalesDistributionData(agentDetails.clients, isMobile)
        : [],
    [agentDetails, isMobile]
  );

  const { months, revenueData, ordersData } = useMemo(
    () =>
      agentDetails
        ? calculateAgentMonthlyData(agentDetails.clients)
        : { months: [], revenueData: [], ordersData: [] },
    [agentDetails]
  );

  const yearlyOrders = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currentYear = new Date().getFullYear();
    return ordersData.reduce((acc, orders, index) => {
      const year = parseInt(months[index].split("-")[0]);
      acc[year] = (acc[year] || 0) + orders;
      return acc;
    }, {} as { [key: number]: number });
  }, [ordersData, months]);

  const yearlyCategories = useMemo(
    () => Object.keys(yearlyOrders).map(String),
    [yearlyOrders]
  );
  const yearlyOrdersData = useMemo(
    () => yearlyCategories.map((year) => yearlyOrders[parseInt(year)]),
    [yearlyCategories, yearlyOrders]
  );

  const selectedClientTopBrandsData = useMemo(
    () => (selectedClient ? calculateAgentTopBrandsData([selectedClient]) : []),
    [selectedClient]
  );

  return {
    agentDetails,
    selectedClient,
    selectClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    totalRevenue,
    totalOrders,
    topBrandsData,
    selectedClientTopBrandsData, // Return top brands data for the selected client
    salesDistributionData,
    months,
    revenueData,
    ordersData,
    yearlyCategories,
    yearlyOrdersData,
    isLoading,
    error,
  };
};

export default useAgentStats;
