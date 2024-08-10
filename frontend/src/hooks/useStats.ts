import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { setVisits } from "../features/calendar/calendarSlice";
import {
  clearSelection,
  fetchInitialData,
  selectAgent,
  selectClient,
} from "../features/data/dataSlice";
import { setPromos } from "../features/promos/promosSlice";
import { Movement } from "../models/dataModels";
import { Agent, Client } from "../models/entityModels";
import {
  calculateMonthlyData,
  calculateMonthlyRevenue,
  calculateSalesDistributionData,
  calculateSalesDistributionDataForAgents,
  calculateTopArticleTypeUtil,
  calculateTopBrandsData,
  calculateTotalOrders,
  calculateTotalRevenue,
  calculateTotalSpentForYear,
  calculateTotalSpentForYearForClients,
} from "../utils/dataUtils";

const useStats = (isMobile: boolean) => {
  const dispatch = useDispatch<AppDispatch>();

  // Get role and entityCode from Redux state
  const role = useSelector((state: RootState) => state.auth.userRole);

  // Get data from the dataSlice
  const {
    clients,
    agentDetails,
    currentUserDetails,
    selectedClientId,
    selectedAgentId,
    status,
    error,
  } = useSelector((state: RootState) => state.data);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  // Create memoized selectors for selectedClient and selectedAgent
  const selectedClient = useMemo(
    () => (selectedClientId ? clients[selectedClientId] : null),
    [clients, selectedClientId]
  );

  const selectedAgent = useMemo(
    () => (selectedAgentId ? agentDetails[selectedAgentId] : null),
    [agentDetails, selectedAgentId]
  );

  // Update the clearSelection, selectClient, and selectAgent functions
  const clearSelectionHandler = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const selectClientHandler = useCallback(
    (clientId: string) => {
      dispatch(selectClient(clientId));
    },
    [dispatch]
  );

  const selectAgentHandler = useCallback(
    (agentId: string) => {
      dispatch(selectAgent(agentId));
    },
    [dispatch]
  );

  const getVisits = useCallback(() => {
    if (selectedClient) {
      return selectedClient.visits || [];
    } else if (selectedAgent) {
      return selectedAgent.AgentVisits || [];
    } else if (currentUserDetails && "GlobalVisits" in currentUserDetails) {
      return (
        Object.values(currentUserDetails.GlobalVisits).flatMap(
          (visitObj) => visitObj.Visits
        ) || []
      );
    }
    return [];
  }, [selectedClient, selectedAgent, currentUserDetails]);

  const getPromos = useCallback(() => {
    if (selectedClient) {
      return selectedClient.promos || [];
    } else if (selectedAgent) {
      return selectedAgent.AgentPromos || [];
    } else if (currentUserDetails && "GlobalPromos" in currentUserDetails) {
      return (
        Object.values(currentUserDetails.GlobalPromos).flatMap(
          (promoObj) => promoObj.Promos
        ) || []
      );
    }
    return [];
  }, [selectedClient, selectedAgent, currentUserDetails]);

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
    if (!currentUserDetails) return 0;

    if (role === "agent") {
      const agentClients = Object.values(clients).filter(
        (client) => client.agent === currentUserDetails.id
      );
      return parseFloat(calculateTotalRevenue(agentClients));
    } else if (role === "client") {
      return parseFloat(calculateTotalRevenue([currentUserDetails as Client]));
    } else if (role === "admin") {
      return parseFloat(calculateTotalRevenue(Object.values(clients)));
    }

    return 0;
  }, [role, currentUserDetails, clients]);

  const totalOrders = useMemo(() => {
    if (!currentUserDetails) return 0;

    if (role === "agent") {
      const agentClients = Object.values(clients).filter(
        (client) => client.agent === currentUserDetails.id
      );
      return calculateTotalOrders(agentClients);
    } else if (role === "client") {
      return calculateTotalOrders([currentUserDetails as Client]);
    } else if (role === "admin") {
      return calculateTotalOrders(Object.values(clients));
    }

    return 0;
  }, [role, currentUserDetails, clients]);

  const topBrandsData = useMemo(() => {
    if (!currentUserDetails) return [];

    if (role === "agent") {
      const agentClients = Object.values(clients).filter(
        (client) => client.agent === currentUserDetails.id
      );
      const movements = agentClients.flatMap((client) => client.movements);
      return calculateTopBrandsData(movements);
    } else if (role === "client") {
      const movements = (currentUserDetails as Client).movements;
      return calculateTopBrandsData(movements);
    } else if (role === "admin") {
      const movements = Object.values(clients).flatMap(
        (client) => client.movements
      );
      return calculateTopBrandsData(movements);
    }

    return [];
  }, [role, currentUserDetails, clients]);

  const salesDistributionDataAgents = useMemo(() => {
    if (!currentUserDetails) return { agents: [], data: [] };

    if (role === "admin") {
      const agentsMap = Object.values(clients).reduce((acc, client) => {
        const agentId = client.agent;
        if (!acc[agentId]) {
          const agentDetail = agentDetails[agentId];
          acc[agentId] = {
            id: agentId,
            name: agentDetail ? agentDetail.name : `Agent ${agentId}`,
            clients: [],
            AgentVisits: [],
            AgentPromos: [],
            agentAlerts: [],
          };
        }
        acc[agentId].clients.push(client);

        // Collect visits and promos from the client and add to the agent
        acc[agentId].AgentVisits.push(...(client.visits || []));
        acc[agentId].AgentPromos.push(...(client.promos || []));

        return acc;
      }, {} as { [key: string]: Agent });

      const agents = Object.values(agentsMap);
      const data = calculateSalesDistributionDataForAgents(agents, isMobile);
      return { agents, data };
    } else if (role === "agent") {
      const agentClients = Object.values(clients).filter(
        (client) => client.agent === currentUserDetails.id
      );
      const data = calculateSalesDistributionData(agentClients, isMobile);
      return { agents: [currentUserDetails as Agent], data };
    }

    return { agents: [], data: [] };
  }, [role, currentUserDetails, clients, agentDetails, isMobile]);

  const salesDistributionDataClients = useMemo(() => {
    if (!currentUserDetails) return [];

    if (role === "admin") {
      return calculateSalesDistributionData(Object.values(clients), isMobile);
    } else if (role === "agent") {
      const agentClients = Object.values(clients).filter(
        (client) => client.agent === currentUserDetails.id
      );
      return calculateSalesDistributionData(agentClients, isMobile);
    }
    return [];
  }, [role, currentUserDetails, clients, isMobile]);

  const { months, revenueData, ordersData } = useMemo(() => {
    if (!currentUserDetails)
      return { months: [], revenueData: [], ordersData: [] };

    if (role === "agent") {
      const agentClients = Object.values(clients).filter(
        (client) => client.agent === currentUserDetails.id
      );
      return calculateMonthlyData(agentClients);
    } else if (role === "client") {
      return calculateMonthlyData([currentUserDetails as Client]);
    } else if (role === "admin") {
      return calculateMonthlyData(Object.values(clients));
    }
    return { months: [], revenueData: [], ordersData: [] };
  }, [role, currentUserDetails, clients]);

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
    if (!selectedClient || Object.keys(clients).length === 0) {
      return { revenuePercentage: 0, ordersPercentage: 0 };
    }

    const clientRevenue = parseFloat(selectedClient.totalRevenue);

    // Calculate total revenue for all clients
    const totalRevenueAllClients = parseFloat(
      calculateTotalRevenue(Object.values(clients))
    );

    // Calculate the percentage of total revenue that this client contributes
    const revenuePercentage = (
      (clientRevenue / totalRevenueAllClients) *
      100
    ).toFixed(2);

    // Calculate total orders for all clients
    const totalOrdersAllClients = Object.values(clients).reduce(
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
  }, [selectedClient, clients]);

  const clientComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedClient || Object.keys(clients).length === 0) {
      return { revenuePercentage: 0, ordersPercentage: 0 };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Helper function to filter movements for the current month and year
    const filterCurrentMonthMovements = (movements: Movement[]) =>
      movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      });

    // Filter movements for the selected client for the current month and year
    const selectedMovements = filterCurrentMonthMovements(selectedClient.movements);

    // Filter movements for all clients for the current month and year
    const allMovements = Object.values(clients).flatMap((client: Client) =>
      filterCurrentMonthMovements(client.movements)
    );

    // Helper function to calculate total revenue from movements
    const calculateTotalRevenue = (movements: Movement[]) =>
      movements.reduce(
        (movementSum, movement) =>
          movementSum +
          movement.details.reduce(
            (detailSum, detail) => detailSum + parseFloat(detail.priceSold),
            0
          ),
        0
      );

    // Calculate the total revenue for the selected client's movements
    const selectedMonthlyTotal = calculateTotalRevenue(selectedMovements);

    // Calculate the total revenue for all clients' movements
    const allMonthlyTotal = calculateTotalRevenue(allMovements);

    // Calculate the percentage of total monthly revenue that this client contributes
    const revenuePercentage = allMonthlyTotal === 0
      ? "0.00"
      : ((selectedMonthlyTotal / allMonthlyTotal) * 100).toFixed(2);

    // Calculate the percentage of total monthly orders that this client contributes
    const ordersPercentage = allMovements.length === 0
      ? "0.00"
      : ((selectedMovements.length / allMovements.length) * 100).toFixed(2);

    return {
      revenuePercentage,
      ordersPercentage,
    };
  }, [selectedClient, clients]);

  const agentComparativeStatistics = useMemo(() => {
    if (!selectedAgent || Object.keys(clients).length === 0) {
      return { revenuePercentage: 0, ordersPercentage: 0 };
    }

    // Filter clients to get the clients belonging to the selected agent
    const agentClients = Object.values(clients).filter(
      (client) => client.agent === selectedAgent.id
    );

    // Calculate the total revenue for the selected agent's clients
    const agentRevenue = parseFloat(calculateTotalRevenue(agentClients));

    // Calculate the total revenue for all clients
    const totalRevenueAllClients = parseFloat(
      calculateTotalRevenue(Object.values(clients))
    );

    // Calculate the percentage of total revenue that this agent's clients contribute
    const revenuePercentage = totalRevenueAllClients === 0
      ? "0.00"
      : ((agentRevenue / totalRevenueAllClients) * 100).toFixed(2);

    // Calculate the total orders for the selected agent's clients
    const agentOrders = calculateTotalOrders(agentClients);

    // Calculate the total orders for all clients
    const totalOrdersAllClients = calculateTotalOrders(Object.values(clients));

    // Calculate the percentage of total orders that this agent's clients contribute
    const ordersPercentage = totalOrdersAllClients === 0
      ? "0.00"
      : ((agentOrders / totalOrdersAllClients) * 100).toFixed(2);

    return {
      revenuePercentage,
      ordersPercentage,
    };
  }, [selectedAgent, clients]);

  const agentComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedAgent || Object.keys(clients).length === 0) {
      return { revenuePercentage: 0, ordersPercentage: 0 };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Helper function to filter movements for the current month and year
    const filterCurrentMonthMovements = (movements: Movement[]) =>
      movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return (
          movementDate.getMonth() === currentMonth &&
          movementDate.getFullYear() === currentYear
        );
      });

    // Helper function to calculate revenue from movements
    const calculateRevenue = (movements: Movement[]) =>
      movements.reduce((movementSum, movement) =>
        movementSum +
        movement.details.reduce(
          (detailSum, detail) => detailSum + (parseFloat(detail.priceSold) || 0),
          0
        ),
      0);

    // Filter clients belonging to the selected agent
    const agentClients = Object.values(clients).filter(
      (client) => client.agent === selectedAgent.id
    );

    // Calculate the total revenue for the selected agent's clients for the current month and year
    const selectedMonthlyTotal = agentClients.reduce(
      (total, client) => total + calculateRevenue(filterCurrentMonthMovements(client.movements)),
      0
    );

    // Calculate the total revenue for all clients for the current month and year
    const allMonthlyTotal = Object.values(clients).reduce(
      (total, client) => total + calculateRevenue(filterCurrentMonthMovements(client.movements)),
      0
    );

    // Calculate the percentage of total monthly revenue that this agent's clients contribute
    const revenuePercentage = allMonthlyTotal === 0
      ? "0.00"
      : ((selectedMonthlyTotal / allMonthlyTotal) * 100).toFixed(2);

    // Calculate the number of orders for the selected agent's clients for the current month and year
    const selectedOrdersTotal = agentClients.reduce(
      (total, client) => total + filterCurrentMonthMovements(client.movements).length,
      0
    );

    // Calculate the total number of orders for all clients for the current month and year
    const allOrdersTotal = Object.values(clients).reduce(
      (total, client) => total + filterCurrentMonthMovements(client.movements).length,
      0
    );

    // Calculate the percentage of total monthly orders that this agent's clients contribute
    const ordersPercentage = allOrdersTotal === 0
      ? "0.00"
      : ((selectedOrdersTotal / allOrdersTotal) * 100).toFixed(2);

    return {
      revenuePercentage,
      ordersPercentage,
    };
  }, [selectedAgent, clients]);

  return {
    details: currentUserDetails,
    selectedClient,
    selectedAgent,
    selectClient: selectClientHandler,
    selectAgent: selectAgentHandler,
    getVisits,
    getPromos,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTotalSpentThisYearForAgents,
    calculateTopArticleType,
    clearSelection: clearSelectionHandler,
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
    isLoading: status === 'loading',
    error,
  };
};

export default useStats;
