import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AdminDetails, Agent, Client, Movement } from "../models/models";
import {
  useGetClientsQuery,
  useGetAgentsQuery,
  useGetAgentDetailsQuery,
} from "../services/api";
import {
  calculateMonthlyData,
  calculateTotalOrders,
  calculateTotalRevenue,
  calculateTopBrandsData,
  calculateSalesDistributionData,
  calculateMonthlyRevenue,
  calculateSalesDistributionDataForAgents,
} from "../utils/dataUtils";
import { setVisits } from "../features/calendar/calendarSlice";
import { setPromos } from "../features/promos/promosSlice";

type Role = "admin" | "agent" | "client";

const useStats = (role: Role, id: string | null, isMobile: boolean) => {
  const dispatch = useDispatch();
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

  const [details, setDetails] = useState<Agent | Client | AdminDetails | null>(
    null
  );
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (
      role === "agent" &&
      !clientsLoading &&
      !agentDetailsLoading &&
      clientsData &&
      agentDetailsData &&
      id
    ) {
      const agent = agentDetailsData.find((agent) => agent.id === id);
      if (agent) {
        const updatedAgent = {
          ...agent,
          clients: clientsData.filter((client) => client.agent === id),
          AgentVisits: clientsData.flatMap((client) => client.visits || []),
          AgentPromos: clientsData.flatMap((client) => client.promos || []),
        };
        setDetails(updatedAgent);
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
      const adminDetails: AdminDetails = {
        agents: agentDetailsData,
        clients: clientsData,
        GlobalVisits: {},
        GlobalPromos: {},
      };
      agentDetailsData.forEach((agent) => {
        adminDetails.GlobalVisits[agent.id] = {
          Visits: agent.AgentVisits || [],
        };
        adminDetails.GlobalPromos[agent.id] = {
          Promos: agent.AgentPromos || [],
        };
      });
      setDetails(adminDetails);
    }
  }, [
    role,
    id,
    clientsLoading,
    agentsLoading,
    agentDetailsLoading,
    clientsData,
    agentsData,
    agentDetailsData,
  ]);

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
        const agent = agentDetailsData.find(
          (agent) => agent.name === agentName
        );
        setSelectedAgent(agent || null);
      }
    },
    [agentDetailsData]
  );

  const getVisits = useCallback(() => {
    if (selectedClient) {
      return selectedClient.visits || [];
    } else if (selectedAgent) {
      return selectedAgent.AgentVisits || [];
    } else if (details && "GlobalVisits" in details) {
      return (
        Object.values(details.GlobalVisits).flatMap(
          (visitObj) => visitObj.Visits
        ) || []
      );
    }
    return [];
  }, [selectedClient, selectedAgent, details]);

  const getPromos = useCallback(() => {
    if (selectedClient) {
      return selectedClient.promos || [];
    } else if (selectedAgent) {
      return selectedAgent.AgentPromos || [];
    } else if (details && "GlobalPromos" in details) {
      return (
        Object.values(details.GlobalPromos).flatMap(
          (promoObj) => promoObj.Promos
        ) || []
      );
    }
    return [];
  }, [selectedClient, selectedAgent, details]);

  useEffect(() => {
    const visits = getVisits();
    dispatch(setVisits(visits));
  }, [getVisits, dispatch]);

  useEffect(() => {
    const promos = getPromos();
    dispatch(setPromos(promos));
  }, [getPromos, dispatch]);

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
          acc[agentId] = {
            id: agentId,
            name: `Agent ${agentId}`,
            clients: [],
            AgentVisits: [],
            AgentPromos: [],
          };
        }
        acc[agentId].clients.push(client);

        // Collect visits and promos from the client and add to the agent
        acc[agentId].AgentVisits.push(...client.visits);
        acc[agentId].AgentPromos.push(...client.promos);

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
    if (!selectedClient || !clientsData || clientsData.length === 0) {
      return { revenuePercentage: 0, ordersPercentage: 0 };
    }

    const clientRevenue = parseFloat(selectedClient.totalRevenue);

    // Calculate total revenue and average revenue per client
    const totalRevenueAllClients = clientsData.reduce(
      (sum, client) => sum + parseFloat(client.totalRevenue),
      0
    );
    const averageRevenue = totalRevenueAllClients / clientsData.length;

    // Calculate the percentage difference in revenue
    const revenuePercentage = (
      ((clientRevenue - averageRevenue) / averageRevenue) *
      100
    ).toFixed(2);

    // Calculate total orders and average orders per client
    const totalOrdersAllClients = clientsData.reduce(
      (sum, client) => sum + client.movements.length,
      0
    );
    const averageOrders = totalOrdersAllClients / clientsData.length;

    // Calculate the percentage difference in orders
    const ordersPercentage = (
      ((selectedClient.movements.length - averageOrders) / averageOrders) *
      100
    ).toFixed(2);

    // Console logs to verify data
    /* console.log("Selected Client Revenue:", clientRevenue);
    console.log("Total Revenue All Clients:", totalRevenueAllClients);
    console.log("Average Revenue per Client:", averageRevenue);
    console.log("Revenue Percentage Difference:", revenuePercentage);
  
    console.log("Selected Client Orders:", selectedClient.movements.length);
    console.log("Total Orders All Clients:", totalOrdersAllClients);
    console.log("Average Orders per Client:", averageOrders);
    console.log("Orders Percentage Difference:", ordersPercentage);  */

    return {
      revenuePercentage,
      ordersPercentage,
    };
  }, [selectedClient, clientsData]);

  const clientComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedClient || !clientsData || clientsData.length === 0) {
      return { revenuePercentage: 0, ordersPercentage: 0 };
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Filter movements for the selected client for the current month and year
    const selectedMovements = selectedClient.movements.filter((movement) => {
      const movementDate = new Date(movement.dateOfOrder);
      return (
        movementDate.getMonth() + 1 === currentMonth &&
        movementDate.getFullYear() === currentYear
      );
    });

    // Filter movements for all clients for the current month and year
    const allMovements = clientsData.flatMap((client) =>
      client.movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      })
    );

    // Calculate the total revenue for the selected client's movements
    const selectedMonthlyTotal = selectedMovements.reduce(
      (movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + parseFloat(detail.priceSold),
          0
        ),
      0
    );

    // Calculate the total revenue for all clients' movements
    const allMonthlyTotal = allMovements.reduce(
      (movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + parseFloat(detail.priceSold),
          0
        ),
      0
    );

    // Calculate the average monthly total for all clients
    const averageMonthlyTotal = allMonthlyTotal / clientsData.length;

    // Calculate the percentage difference in revenue
    const revenuePercentage = (
      ((selectedMonthlyTotal - averageMonthlyTotal) / averageMonthlyTotal) *
      100
    ).toFixed(2);

    // Calculate the average number of orders for all clients
    const averageOrders = allMovements.length / clientsData.length;

    // Calculate the percentage difference in orders
    const ordersPercentage = (
      ((selectedMovements.length - averageOrders) / averageOrders) *
      100
    ).toFixed(2);

    // Console logs to verify data
    /* console.log("Selected Client Monthly Revenue:", selectedMonthlyTotal);
    console.log("Total Monthly Revenue All Clients:", allMonthlyTotal);
    console.log("Average Monthly Revenue per Client:", averageMonthlyTotal);
    console.log("Monthly Revenue Percentage Difference:", revenuePercentage);
  
    console.log("Selected Client Monthly Orders:", selectedMovements.length);
    console.log("Total Monthly Orders All Clients:", allMovements.length);
    console.log("Average Monthly Orders per Client:", averageOrders);
    console.log("Monthly Orders Percentage Difference:", ordersPercentage);
   */
    return {
      revenuePercentage,
      ordersPercentage,
    };
  }, [selectedClient, clientsData]);

  const agentComparativeStatistics = useMemo(() => {
    if (
      !selectedAgent ||
      !clientsData ||
      clientsData.length === 0 ||
      !agentsData ||
      agentsData.length === 0
    ) {
      return { revenuePercentage: 0, ordersPercentage: 0 };
    }
  
    console.log("Selected Agent:", selectedAgent);
    console.log("Selected Agent Clients:", selectedAgent.clients);
  
    // Filter clientsData to get the clients belonging to the selected agent
    const agentClients = clientsData.filter(client => client.agent === selectedAgent.id);
  
    // Calculate the total revenue for the selected agent's clients
    const agentRevenue = parseFloat(calculateTotalRevenue(agentClients));
  
    // Calculate the total revenue for all clients
    const totalRevenueAllClients = parseFloat(calculateTotalRevenue(clientsData));
  
    // Calculate the average revenue per agent
    const averageRevenuePerAgent = totalRevenueAllClients / agentsData.length;
  
    // Calculate the percentage difference in revenue
    const revenuePercentage = (
      ((agentRevenue - averageRevenuePerAgent) / averageRevenuePerAgent) *
      100
    ).toFixed(2);
  
    // Calculate the total orders for the selected agent's clients
    const agentOrders = calculateTotalOrders(agentClients);
  
    // Calculate the total orders for all clients
    const totalOrdersAllClients = calculateTotalOrders(clientsData);
  
    // Calculate the average number of orders per agent
    const averageOrdersPerAgent = totalOrdersAllClients / agentsData.length;
  
    // Calculate the percentage difference in orders
    const ordersPercentage = (
      ((agentOrders - averageOrdersPerAgent) / averageOrdersPerAgent) *
      100
    ).toFixed(2);
  
    // Console logs to verify data
   /*  console.log("Selected Agent Revenue:", agentRevenue);
    console.log("Total Revenue All Clients:", totalRevenueAllClients);
    console.log("Average Revenue per Agent:", averageRevenuePerAgent);
    console.log("Revenue Percentage Difference:", revenuePercentage);
  
    console.log("Selected Agent Orders:", agentOrders);
    console.log("Total Orders All Clients:", totalOrdersAllClients);
    console.log("Average Orders per Agent:", averageOrdersPerAgent);
    console.log("Orders Percentage Difference:", ordersPercentage); */
  
    return {
      revenuePercentage,
      ordersPercentage,
    };
  }, [selectedAgent, clientsData, agentsData]);
  

  const agentComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedAgent || !clientsData || clientsData.length === 0) {
      return { revenuePercentage: 0, ordersPercentage: 0 };
    }
  
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
  
    // Filter clientsData to get the clients belonging to the selected agent
    const agentClients = clientsData.filter(client => client.agent === selectedAgent.id);
  
    // Filter movements for the selected agent's clients for the current month and year
    const selectedMovements = agentClients.flatMap(client =>
      client.movements.filter(movement => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      })
    );
  
    // Filter movements for all clients for the current month and year
    const allMovements = clientsData.flatMap(client =>
      client.movements.filter(movement => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      })
    );
  
    // Calculate the total revenue for the selected agent's movements
    const selectedMonthlyTotal = selectedMovements.reduce(
      (movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + (parseFloat(detail.priceSold) || 0),
          0
        ),
      0
    );
  
    // Calculate the total revenue for all clients' movements
    const allMonthlyTotal = allMovements.reduce(
      (movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + (parseFloat(detail.priceSold) || 0),
          0
        ),
      0
    );
  
    // Calculate the average monthly total for all clients
    const averageMonthlyTotal = allMonthlyTotal / clientsData.length;
  
    // Calculate the percentage difference in revenue
    const revenuePercentage = (
      ((selectedMonthlyTotal - averageMonthlyTotal) / averageMonthlyTotal) *
      100
    ).toFixed(2);
  
    // Calculate the average number of orders for all clients
    const averageOrders = allMovements.length / clientsData.length;
  
    // Calculate the percentage difference in orders
    const ordersPercentage = (
      ((selectedMovements.length - averageOrders) / averageOrders) *
      100
    ).toFixed(2);
  
    // Console logs to verify data
    /* console.log("Selected Agent Monthly Revenue:", selectedMonthlyTotal);
    console.log("Total Monthly Revenue All Clients:", allMonthlyTotal);
    console.log("Average Monthly Revenue per Client:", averageMonthlyTotal);
    console.log("Monthly Revenue Percentage Difference:", revenuePercentage);
  
    console.log("Selected Agent Monthly Orders:", selectedMovements.length);
    console.log("Total Monthly Orders All Clients:", allMovements.length);
    console.log("Average Monthly Orders per Client:", averageOrders);
    console.log("Monthly Orders Percentage Difference:", ordersPercentage); */
  
    return {
      revenuePercentage,
      ordersPercentage,
    };
  }, [selectedAgent, clientsData]);
  

  return {
    details,
    selectedClient,
    selectedAgent,
    selectClient,
    selectAgent,
    getVisits,
    getPromos,
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
    isLoading:
      clientsLoading ||
      (role === "admin" && (agentsLoading || agentDetailsLoading)),
    error:
      clientsError || (role === "admin" && (agentsError || agentDetailsError)),
  };
};

export default useStats;
