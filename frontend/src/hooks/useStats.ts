import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminDetails, Agent, Client, Movement } from "../models/models";
import { useGetClientsQuery, useGetAgentsQuery, useGetAgentDetailsQuery } from "../services/api";
import {
  calculateMonthlyData,
  calculateTotalOrders,
  calculateTotalRevenue,
  calculateTopBrandsData,
  calculateSalesDistributionData,
  calculateMonthlyRevenue,
  calculateSalesDistributionDataForAgents,
} from "../utils/dataUtils";

type Role = "admin" | "agent" | "client";

const useStats = (role: Role, id: string | null, isMobile: boolean) => {
  const {
    data: clientsData,
    isLoading: clientsLoading,
    error: clientsError,
  } = useGetClientsQuery();
  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
  } = useGetAgentsQuery();
  const {
    data: agentDetailsData,
    isLoading: agentDetailsLoading,
    error: agentDetailsError,
  } = useGetAgentDetailsQuery();

  const [details, setDetails] = useState<Agent | Client | AdminDetails | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (role === "agent" && !clientsLoading && !agentDetailsLoading && clientsData && agentDetailsData && id) {
      const agent = agentDetailsData.find((agent) => agent.id === id);
      if (agent) {
        agent.clients = clientsData.filter((client) => client.agent === id);
        setDetails(agent);
      }
    } else if (role === "client" && !clientsLoading && clientsData && id) {
      const client = clientsData.find((client) => client.id === id);
      setDetails(client || null);
    } else if (
      role === "admin" &&
      !clientsLoading &&
      !agentsLoading &&
      !agentDetailsLoading &&
      clientsData &&
      agentsData &&
      agentDetailsData
    ) {
      const adminDetails = { agents: agentDetailsData, clients: clientsData };
      setDetails(adminDetails);
    }
  }, [role, id, clientsLoading, agentsLoading, agentDetailsLoading, clientsData, agentsData, agentDetailsData]);

  const selectClient = useCallback(
    (clientName: string) => {
      if (clientsData) {
        if (clientName === "") {
          setSelectedClient(null);
          return;
        }
        const client = clientsData.find((client) => client.name === clientName);
        setSelectedClient(client || null);
      }
    },
    [clientsData]
  );

  const selectAgent = useCallback(
    (agentName: string) => {
      if (agentDetailsData) {
        if (agentName === "") {
          setSelectedAgent(null);
          return;
        }
        const agent = agentDetailsData.find((agent) => agent.name === agentName);
        setSelectedAgent(agent || null);
      }
    },
    [agentDetailsData]
  );

  const calculateTotalSpentThisMonth = useCallback((movements: Movement[]) => {
    const totalSpent = calculateMonthlyRevenue(movements);
    return totalSpent;
  }, []);

  const calculateTotalSpentThisYear = useCallback((movements: Movement[]) => {
    const currentYear = new Date().getFullYear();
    const totalSpent = movements
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
    return totalSpent;
  }, []);

  const calculateTotalSpentThisYearForAgents = useCallback(
    (clients: Client[]) => {
      const currentYear = new Date().getFullYear();
      const totalSpent = clients
        .reduce((total, client) => {
          const clientTotal = client.movements
            .filter((movement) => {
              const isCurrentYear =
                new Date(movement.dateOfOrder).getFullYear() === currentYear;
              return isCurrentYear;
            })
            .reduce((movementTotal, movement) => {
              const movementSum = movement.details.reduce((sum, detail) => {
                const priceSold = parseFloat(detail.priceSold);
                return sum + priceSold;
              }, 0);
              return movementTotal + movementSum;
            }, 0);
          return total + clientTotal;
        }, 0)
        .toFixed(2);
      return totalSpent;
    },
    []
  );

  const calculateTopArticleType = useCallback((movements: Movement[]) => {
    const ignoreArticleNames = new Set([
      "RESO CARCASSA",
      "TRASPORTO ",
      "TRASPORTO URGENTE",
    ]);
  
    const typeCount: {
      [key: string]: { id: string; name: string; amount: number };
    } = {};
    movements.forEach((movement) => {
      movement.details.forEach((detail) => {
        if (!ignoreArticleNames.has(detail.name)) {
          if (!typeCount[detail.name]) {
            typeCount[detail.name] = {
              id: detail.articleId,
              name: detail.name,
              amount: 0,
            };
          }
          typeCount[detail.name].amount += 1;
        }
      });
    });
    const sortedArticles = Object.values(typeCount).sort(
      (a, b) => b.amount - a.amount
    );
    return sortedArticles.slice(0, 5); // Return top 5 articles
  }, []);
  

  const totalRevenue = useMemo(() => {
    if (role === "agent" && details) {
      return parseFloat(calculateTotalRevenue((details as Agent).clients));
    } else if (role === "client" && details) {
      return parseFloat(calculateTotalRevenue([details as Client]));
    } else if (role === "admin" && details) {
      return parseFloat(
        calculateTotalRevenue((details as { clients: Client[] }).clients)
      );
    }
    return 0;
  }, [role, details]);

  const totalOrders = useMemo(() => {
    if (role === "agent" && details) {
      return calculateTotalOrders((details as Agent).clients);
    } else if (role === "client" && details) {
      return calculateTotalOrders([details as Client]);
    } else if (role === "admin" && details) {
      return calculateTotalOrders((details as { clients: Client[] }).clients);
    }
    return 0;
  }, [role, details]);

  const topBrandsData = useMemo(() => {
    if (role === "agent" && details) {
      return calculateTopBrandsData((details as Agent).clients);
    } else if (role === "client" && details) {
      return calculateTopBrandsData([details as Client]);
    } else if (role === "admin" && details) {
      return calculateTopBrandsData((details as { clients: Client[] }).clients);
    }
    return [];
  }, [role, details]);

  const salesDistributionDataAgents = useMemo(() => {
    if (role === "admin" && details) {
      const clients = (details as { clients: Client[] }).clients;

      const agentsMap = clients.reduce((acc, client) => {
        const agentId = client.agent;
        if (!acc[agentId]) {
          acc[agentId] = { id: agentId, name: `Agent ${agentId}`, clients: [] };
        }
        acc[agentId].clients.push(client);
        return acc;
      }, {} as { [key: string]: Agent });

      const agents = Object.values(agentsMap);
      const data = calculateSalesDistributionDataForAgents(agents, isMobile);
      return { agents, data };
    } else if (role === "agent" && details) {
      const agent = details as Agent;
      const data = calculateSalesDistributionData(agent.clients, isMobile);
      return { agents: [agent], data };
    }
    return { agents: [], data: [] };
  }, [role, details, isMobile]);

  const salesDistributionDataClients = useMemo(() => {
    if ((role === "admin" || role === "agent") && details) {
      const clients =
        role === "admin"
          ? (details as { clients: Client[] }).clients
          : (details as Agent).clients;
      return calculateSalesDistributionData(clients, isMobile);
    }
    return [];
  }, [role, details, isMobile]);

  const { months, revenueData, ordersData } = useMemo(() => {
    if (role === "agent" && details) {
      return calculateMonthlyData((details as Agent).clients);
    } else if (role === "client" && details) {
      return calculateMonthlyData([details as Client]);
    } else if (role === "admin" && details) {
      return calculateMonthlyData((details as { clients: Client[] }).clients);
    }
    return { months: [], revenueData: [], ordersData: [] };
  }, [role, details]);

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

  const clientComparativeStatistics = useMemo(() => {
    if (!selectedClient || !clientsData)
      return { revenuePercentage: 0, ordersPercentage: 0 };

    const clientRevenue = parseFloat(selectedClient.totalRevenue);
    const totalRevenueAllClients = clientsData.reduce(
      (sum, client) => sum + parseFloat(client.totalRevenue),
      0
    );

    return {
      revenuePercentage: (
        (clientRevenue / totalRevenueAllClients) *
        100
      ).toFixed(2),
      ordersPercentage: (
        (selectedClient.movements.length / totalOrders) *
        100
      ).toFixed(2),
    };
  }, [selectedClient, clientsData, totalOrders]);

  const clientComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedClient || !clientsData)
      return { revenuePercentage: 0, ordersPercentage: 0 };

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const selectedMovements = selectedClient.movements.filter((movement) => {
      const movementDate = new Date(movement.dateOfOrder);
      return (
        movementDate.getMonth() + 1 === currentMonth &&
        movementDate.getFullYear() === currentYear
      );
    });

    const allMovements = clientsData.flatMap((client) =>
      client.movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      })
    );

    const selectedMonthlyTotal = selectedMovements.reduce(
      (movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + parseFloat(detail.priceSold),
          0
        ),
      0
    );

    const allMonthlyTotal = allMovements.reduce(
      (movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + parseFloat(detail.priceSold),
          0
        ),
      0
    );

    return {
      revenuePercentage: (
        (selectedMonthlyTotal / allMonthlyTotal) *
        100
      ).toFixed(2),
      ordersPercentage: (
        (selectedMovements.length / allMovements.length) *
        100
      ).toFixed(2),
    };
  }, [selectedClient, clientsData]);

  const agentComparativeStatistics = useMemo(() => {
    if (!selectedAgent || !clientsData)
      return { revenuePercentage: 0, ordersPercentage: 0 };

    const agentClients = selectedAgent.clients;
    const agentRevenue = agentClients.reduce(
      (sum, client) => sum + parseFloat(client.totalRevenue),
      0
    );
    const totalRevenueAllClients = clientsData.reduce(
      (sum, client) => sum + parseFloat(client.totalRevenue),
      0
    );

    return {
      revenuePercentage: (
        (agentRevenue / totalRevenueAllClients) *
        100
      ).toFixed(2),
      ordersPercentage: (
        (agentClients.reduce(
          (sum, client) => sum + client.movements.length,
          0
        ) /
          totalOrders) *
        100
      ).toFixed(2),
    };
  }, [selectedAgent, clientsData, totalOrders]);

  const agentComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedAgent || !clientsData)
      return { revenuePercentage: 0, ordersPercentage: 0 };

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const selectedMovements = selectedAgent.clients.flatMap((client) =>
      client.movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      })
    );

    const allMovements = clientsData.flatMap((client) =>
      client.movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      })
    );

    const selectedMonthlyTotal = selectedMovements.reduce(
      (movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + parseFloat(detail.priceSold),
          0
        ),
      0
    );

    const allMonthlyTotal = allMovements.reduce(
      (movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + parseFloat(detail.priceSold),
          0
        ),
      0
    );

    return {
      revenuePercentage: (
        (selectedMonthlyTotal / allMonthlyTotal) *
        100
      ).toFixed(2),
      ordersPercentage: (
        (selectedMovements.length / allMovements.length) *
        100
      ).toFixed(2),
    };
  }, [selectedAgent, clientsData]);

  return {
    details,
    selectedClient,
    selectedAgent,
    selectClient,
    selectAgent,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTotalSpentThisYearForAgents,
    calculateTopArticleType,
    totalRevenue,
    totalOrders,
    topBrandsData,
    salesDistributionDataClients,
    salesDistributionDataAgents,
    months,
    revenueData,
    ordersData,
    yearlyCategories,
    yearlyOrdersData,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
    isLoading: clientsLoading || (role === "admin" && (agentsLoading || agentDetailsLoading)),
    error: clientsError || (role === "admin" && (agentsError || agentDetailsError)),
  };
};

export default useStats;
