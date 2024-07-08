import { useCallback, useMemo, useState } from "react";
import { Client, Agent, Movement } from "../models/models";
import { useGetClientsQuery, useGetAgentsQuery } from "../services/api";
import { calculateMonthlyData } from "../utils/dataLoader";
import {
  calculateTotalOrders,
  calculateTotalRevenue,
  calculateTopBrandsData,
  calculateSalesDistributionData,
} from "../utils/dataUtils";

const useAdminStats = (isMobile: boolean) => {
  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useGetClientsQuery();
  const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useGetAgentsQuery();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const calculateMonthlyComparativeStats = useCallback((selectedMovements: Movement[], allMovements: Movement[], currentMonth: number, currentYear: number) => {
    const selectedMonthlyTotal = selectedMovements
      .filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return movementDate.getMonth() + 1 === currentMonth && movementDate.getFullYear() === currentYear;
      })
      .reduce((movementSum, movement) => movementSum + movement.details.reduce((detailSum, detail) => detailSum + parseFloat(detail.priceSold), 0), 0);

    const allMonthlyTotal = allMovements
      .filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return movementDate.getMonth() + 1 === currentMonth && movementDate.getFullYear() === currentYear;
      })
      .reduce((movementSum, movement) => movementSum + movement.details.reduce((detailSum, detail) => detailSum + parseFloat(detail.priceSold), 0), 0);

    return {
      selectedMonthlyTotal,
      allMonthlyTotal,
    };
  }, []);

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
      if (clientsData) {
        if (clientName === "") {
          setSelectedClient(null);
          return;
        }
        const client = clientsData.find(
          (client) => client.name === clientName
        );
        if (client) {
          setSelectedClient(client);
        } else {
          console.error("Client not found");
        }
      }
    },
    [clientsData]
  );

  const selectAgent = useCallback(
    (agentName: string) => {
      if (agentsData) {
        if (agentName === "") {
          setSelectedAgent(null);
          return;
        }
        const agent = agentsData.find(
          (agent) => agent.name === agentName
        );
        if (agent) {
          setSelectedAgent(agent);
        } else {
          console.error("Agent not found");
        }
      }
    },
    [agentsData]
  );

  const totalRevenue = useMemo(() => {
    const clients = selectedAgent ? selectedAgent.clients : clientsData;
    return clients ? parseFloat(calculateTotalRevenue(clients)) : 0;
  }, [clientsData, selectedAgent]);

  const totalOrders = useMemo(() => {
    const clients = selectedAgent ? selectedAgent.clients : clientsData;
    return clients ? calculateTotalOrders(clients) : 0;
  }, [clientsData, selectedAgent]);

  const topBrandsData = useMemo(() => {
    const clients = selectedAgent ? selectedAgent.clients : clientsData;
    return clients ? calculateTopBrandsData(clients) : [];
  }, [clientsData, selectedAgent]);

  const salesDistributionDataClients = useMemo(() => {
    const clients = selectedAgent ? selectedAgent.clients : clientsData;
    return clients ? calculateSalesDistributionData(clients, isMobile) : [];
  }, [clientsData, selectedAgent, isMobile]);

  const salesDistributionDataAgents = useMemo(() => {
    if (!agentsData) return [];
    return calculateSalesDistributionData(agentsData.map(agent => ({
        id: agent.id,
        name: agent.name,
        movements: agent.clients.flatMap(client => client.movements),
        totalRevenue: agent.clients.reduce((sum, client) => sum + parseFloat(client.totalRevenue), 0).toString(),
        totalOrders: agent.clients.reduce((sum, client) => sum + client.totalOrders, 0),
        unpaidRevenue: "0", // Placeholder, update if you have this data
        visits: [], // Placeholder, update if you have this data
        agent: agent.id,
        promos: [], // Placeholder, update if you have this data
      // other necessary fields if needed
    })), isMobile);
  }, [agentsData, isMobile]);

  const { months, revenueData, ordersData } = useMemo(() => {
    const clients = selectedAgent ? selectedAgent.clients : clientsData;
    return clients ? calculateMonthlyData(clients) : { months: [], revenueData: [], ordersData: [] };
  }, [clientsData, selectedAgent]);

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
    () => (selectedClient ? calculateTopBrandsData([selectedClient]) : []),
    [selectedClient]
  );

  // Calculate comparative statistics for Agents
  const totalRevenueAllAgents = useMemo(
    () => (agentsData ? agentsData.reduce((sum, agent) => sum + agent.clients.reduce((clientSum, client) => clientSum + parseFloat(client.totalRevenue), 0), 0) : 0),
    [agentsData]
  );

  const totalOrdersAllAgents = useMemo(
    () => (agentsData ? agentsData.reduce((sum, agent) => sum + agent.clients.reduce((clientSum, client) => clientSum + client.movements.length, 0), 0) : 0),
    [agentsData]
  );

  const agentComparativeStatistics = useMemo(() => {
    if (!selectedAgent || !agentsData) return { revenuePercentage: 0, ordersPercentage: 0 };

    const agentRevenue = selectedAgent.clients.reduce((sum, client) => sum + parseFloat(client.totalRevenue), 0);
    const agentOrders = selectedAgent.clients.reduce((sum, client) => sum + client.movements.length, 0);

    return {
      revenuePercentage: ((agentRevenue / totalRevenueAllAgents) * 100).toFixed(2),
      ordersPercentage: ((agentOrders / totalOrdersAllAgents) * 100).toFixed(2),
    };
  }, [selectedAgent, agentsData, totalRevenueAllAgents, totalOrdersAllAgents]);

  const agentComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedAgent || !agentsData) return { revenuePercentage: 0, ordersPercentage: 0 };

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { selectedMonthlyTotal: agentMonthlyRevenue, allMonthlyTotal: totalRevenueAllAgentsMonthly } = calculateMonthlyComparativeStats(
      selectedAgent.clients.flatMap((client) => client.movements),
      agentsData.flatMap((agent) => agent.clients.flatMap((client) => client.movements)),
      currentMonth,
      currentYear
    );

    return {
      revenuePercentage: ((agentMonthlyRevenue / totalRevenueAllAgentsMonthly) * 100).toFixed(2),
      ordersPercentage: ((selectedAgent.clients.reduce((sum, client) => sum + client.movements.length, 0) / totalOrdersAllAgents) * 100).toFixed(2),
    };
  }, [selectedAgent, agentsData, calculateMonthlyComparativeStats, totalOrdersAllAgents]);

  // Calculate comparative statistics for Clients
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalRevenueAllClients = useMemo(
    () => (clientsData ? clientsData.reduce((sum, client) => sum + parseFloat(client.totalRevenue), 0) : 0),
    [clientsData]
  );

  const totalOrdersAllClients = useMemo(
    () => (clientsData ? clientsData.reduce((sum, client) => sum + client.movements.length, 0) : 0),
    [clientsData]
  );

  const clientComparativeStatistics = useMemo(() => {
    if (!selectedClient || !clientsData) return { revenuePercentage: 0, ordersPercentage: 0 };

    const clientRevenue = parseFloat(selectedClient.totalRevenue);
    const totalRevenueAllClients = clientsData.reduce((sum, client) => sum + parseFloat(client.totalRevenue), 0);

    return {
      revenuePercentage: ((clientRevenue / totalRevenueAllClients) * 100).toFixed(2),
      ordersPercentage: 0, // Add logic if needed
    };
  }, [selectedClient, clientsData]);

  const clientComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedClient || !clientsData) return { revenuePercentage: 0, ordersPercentage: 0 };

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { selectedMonthlyTotal: clientMonthlyRevenue, allMonthlyTotal: totalRevenueAllClientsMonthly } = calculateMonthlyComparativeStats(
      selectedClient.movements,
      clientsData.flatMap((client) => client.movements),
      currentMonth,
      currentYear
    );

    return {
      revenuePercentage: ((clientMonthlyRevenue / totalRevenueAllClientsMonthly) * 100).toFixed(2),
      ordersPercentage: ((selectedClient.movements.length / totalOrdersAllClients) * 100).toFixed(2),
    };
  }, [selectedClient, clientsData, calculateMonthlyComparativeStats, totalOrdersAllClients]);

  // Placeholder data for agent activity overview
  const agentActivityOverview = useMemo(() => {
    if (!selectedAgent) return [];

    // Generate some placeholder data for the selected agent
    return [
      {
        id: "1",
        type: "visits",
        title: `${selectedAgent.clients.length} Visits This Month`,
        time: new Date(),
      },
      {
        id: "2",
        type: "sales",
        title: `${selectedAgent.clients.reduce((sum, client) => sum + client.movements.length, 0)} Sales This Month`,
        time: new Date(),
      },
      /* {
        id: "3",
        type: "alerts",
        title: `${selectedAgent.clients.reduce((sum, client) => sum + (client.alerts ? client.alerts.length : 0), 0)} Alerts Received`,
        time: new Date(),
      }, */
    ];
  }, [selectedAgent]);

  return {
    clientsData,
    agentsData,
    selectedClient,
    selectedAgent,
    selectClient,
    selectAgent,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    totalRevenue,
    totalOrders,
    topBrandsData,
    selectedClientTopBrandsData,
    salesDistributionDataClients,
    salesDistributionDataAgents,
    months,
    revenueData,
    ordersData,
    yearlyCategories,
    yearlyOrdersData,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentActivityOverview,
    isLoading: clientsLoading || agentsLoading,
    error: clientsError || agentsError,
  };
};

export default useAdminStats;
