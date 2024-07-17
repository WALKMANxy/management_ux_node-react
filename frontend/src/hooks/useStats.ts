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
  calculateTotalSpentForYear,
  calculateTotalSpentForYearForClients,
  calculateTopArticleTypeUtil,
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
  
  const clearSelection = useCallback(() => {
    setSelectedClient(null);
    setSelectedAgent(null);
    sessionStorage.removeItem('selectedItem'); // Clear sessionStorage when clearing selection
  }, []);

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
    return calculateTotalSpentForYear(movements, currentYear);
  }, []);

  const calculateTotalSpentThisYearForAgents = useCallback(
    (clients: Client[]) => {
      const currentYear = new Date().getFullYear();
      return calculateTotalSpentForYearForClients(clients, currentYear);
    },
    []
  );

  const calculateTopArticleType = useCallback((movements: Movement[]) => {
    return calculateTopArticleTypeUtil(movements);
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
      const movements = (details as Agent).clients.flatMap(client => client.movements);
      return calculateTopBrandsData(movements);
    } else if (role === "client" && details) {
      const movements = (details as Client).movements;
      return calculateTopBrandsData(movements);
    } else if (role === "admin" && details) {
      const movements = (details as { clients: Client[] }).clients.flatMap(client => client.movements);
      return calculateTopBrandsData(movements);
    }
    return [];
  }, [role, details]);
  

  const salesDistributionDataAgents = useMemo(() => {
    if (role === "admin" && details && agentDetailsData) {
      const clients = (details as { clients: Client[] }).clients;

      const agentsMap = clients.reduce((acc, client) => {
        const agentId = client.agent;
        if (!acc[agentId]) {
          const agentDetails = agentDetailsData.find(
            (agent) => agent.id === agentId
          );
          acc[agentId] = {
            id: agentId,
            name: agentDetails ? agentDetails.name : `Agent ${agentId}`,
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
  }, [role, details, agentDetailsData, isMobile]);

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
    return (ordersData as number[]).reduce<{ [key: number]: number }>(
      (acc, orders, index) => {
        const year = parseInt(months[index].split("-")[0]);
        acc[year] = (acc[year] || 0) + orders;
        return acc;
      },
      {}
    );
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

    // Calculate total revenue for all clients
    const totalRevenueAllClients = parseFloat(
      calculateTotalRevenue(clientsData)
    );

    // Calculate the percentage of total revenue that this client contributes
    const revenuePercentage = (
      (clientRevenue / totalRevenueAllClients) *
      100
    ).toFixed(2);

    // Calculate total orders and average orders per client
    const totalOrdersAllClients = clientsData.reduce(
      (sum, client) => sum + client.movements.length,
      0
    );

    // Calculate the percentage of total orders that this client contributes
    const ordersPercentage = (
      (selectedClient.movements.length / totalOrdersAllClients) *
      100
    ).toFixed(2);

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

    // Calculate the percentage of total monthly revenue that this client contributes
    const revenuePercentage = (
      (selectedMonthlyTotal / allMonthlyTotal) *
      100
    ).toFixed(2);

    // Calculate the percentage of total monthly orders that this client contributes
    const ordersPercentage = (
      (selectedMovements.length / allMovements.length) *
      100
    ).toFixed(2);

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
/* 
    console.log("Selected Agent:", selectedAgent);
    console.log("Selected Agent Clients:", selectedAgent.clients);
 */
    // Filter clientsData to get the clients belonging to the selected agent
    const agentClients = clientsData.filter(
      (client) => client.agent === selectedAgent.id
    );

    // Calculate the total revenue for the selected agent's clients
    const agentRevenue = parseFloat(calculateTotalRevenue(agentClients));

    // Calculate the total revenue for all clients
    const totalRevenueAllClients = parseFloat(
      calculateTotalRevenue(clientsData)
    );

    // Calculate the percentage of total revenue that this agent's clients contribute
    const revenuePercentage = (
      (agentRevenue / totalRevenueAllClients) *
      100
    ).toFixed(2);

    // Calculate the total orders for the selected agent's clients
    const agentOrders = calculateTotalOrders(agentClients);

    // Calculate the total orders for all clients
    const totalOrdersAllClients = calculateTotalOrders(clientsData);

    // Calculate the percentage of total orders that this agent's clients contribute
    const ordersPercentage = (
      (agentOrders / totalOrdersAllClients) *
      100
    ).toFixed(2);

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
    const agentClients = clientsData.filter(
      (client) => client.agent === selectedAgent.id
    );
  
    //console.log("Agent Clients:", agentClients);
  
    // Calculate the total revenue for the selected agent's clients for the current month and year
    const selectedMonthlyTotal = agentClients.reduce((total, client) => {
      const monthlyRevenue = client.movements
        .filter((movement) => {
          const movementDate = new Date(movement.dateOfOrder);
          return (
            movementDate.getMonth() + 1 === currentMonth &&
            movementDate.getFullYear() === currentYear
          );
        })
        .reduce((movementSum, movement) => {
          return (
            movementSum +
            movement.details.reduce(
              (detailSum, detail) =>
                detailSum + (parseFloat(detail.priceSold) || 0),
              0
            )
          );
        }, 0);
      return total + monthlyRevenue;
    }, 0);
  
    //console.log("Selected Agent's Monthly Total Revenue:", selectedMonthlyTotal);
  
    // Calculate the total revenue for all clients for the current month and year
    const allMonthlyTotal = clientsData.reduce((total, client) => {
      const monthlyRevenue = client.movements
        .filter((movement) => {
          const movementDate = new Date(movement.dateOfOrder);
          return (
            movementDate.getMonth() + 1 === currentMonth &&
            movementDate.getFullYear() === currentYear
          );
        })
        .reduce((movementSum, movement) => {
          return (
            movementSum +
            movement.details.reduce(
              (detailSum, detail) =>
                detailSum + (parseFloat(detail.priceSold) || 0),
              0
            )
          );
        }, 0);
      return total + monthlyRevenue;
    }, 0);
  
    //console.log("All Clients' Monthly Total Revenue:", allMonthlyTotal);
  
    // Calculate the percentage of total monthly revenue that this agent's clients contribute
    const revenuePercentage = (
      (selectedMonthlyTotal / allMonthlyTotal) *
      100
    ).toFixed(2);
  
    //console.log("Revenue Percentage:", revenuePercentage);
  
    // Calculate the number of orders for the selected agent's clients for the current month and year
    const selectedOrdersTotal = agentClients.reduce((total, client) => {
      const monthlyOrders = client.movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      }).length;
      return total + monthlyOrders;
    }, 0);
  
    //console.log("Selected Agent's Monthly Total Orders:", selectedOrdersTotal);
  
    // Calculate the total number of orders for all clients for the current month and year
    const allOrdersTotal = clientsData.reduce((total, client) => {
      const monthlyOrders = client.movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() + 1 === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      }).length;
      return total + monthlyOrders;
    }, 0);
  
    //console.log("All Clients' Monthly Total Orders:", allOrdersTotal);
  
    // Calculate the percentage of total monthly orders that this agent's clients contribute
    const ordersPercentage = (
      (selectedOrdersTotal / allOrdersTotal) *
      100
    ).toFixed(2);
  
    //console.log("Orders Percentage:", ordersPercentage);
  
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
    clearSelection,
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
