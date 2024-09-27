import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import {
  clearSelection,
  selectAgent,
  selectClient,
} from "../features/data/dataSlice";
import { Movement } from "../models/dataModels";
import { TopArticleType } from "../models/dataSetTypes";
import { Agent, Client } from "../models/entityModels";
import { DataSliceState } from "../models/stateModels";
import {
  calculateMonthlyData,
  calculateMonthlyRevenue,
  calculatePercentage,
  calculateRevenue,
  calculateSalesDistributionData,
  calculateSalesDistributionDataForAgents,
  calculateTopArticleTypeUtil,
  calculateTopBrandsData,
  calculateTotalOrders,
  calculateTotalRevenue,
  calculateTotalSpentForYear,
  calculateTotalSpentForYearForClients,
  filterCurrentMonthMovements,
  getAdjustedClients,
  getMovementsByRole,
} from "../utils/dataUtils";
import useLoadingData from "./useLoadingData";

const useStats = (isMobile: boolean) => {
  const dispatch = useAppDispatch();

  const {
    localError,
    clients,
    agents,
    role,
    currentUserData,
    currentUserDetails,
    error,
  } = useLoadingData();

  // Get data from the dataSlice
  const {
    selectedClientId, // ID of the currently selected client
    selectedAgentId, // ID of the currently selected agent
  } = useAppSelector<RootState, DataSliceState>((state) => state.data);

  const agentDetails = agents;

  // Create memoized selectors for selectedClient and selectedAgent
  const selectedClient = useMemo(
    () => (selectedClientId ? clients[selectedClientId] : null),
    [clients, selectedClientId]
  );

  const selectedAgent = useMemo(
    () => (selectedAgentId ? agents[selectedAgentId] : null),
    [agents, selectedAgentId]
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

  const calculateTopArticleType = useCallback(
    (movements: Movement[]): TopArticleType[] => {
      return calculateTopArticleTypeUtil(movements);
    },
    []
  );

  // Memoized Data Calculations
  const totalRevenue = useMemo<number>(() => {
    if (!currentUserData || !role) return 0;

    const clientList = getAdjustedClients(role, currentUserData, clients);
    return parseFloat(calculateTotalRevenue(clientList));
  }, [role, currentUserData, clients]);

  const totalOrders = useMemo<number>(() => {
    if (!currentUserData || !role) return 0;

    const clientList = getAdjustedClients(role, currentUserData, clients);
    return calculateTotalOrders(clientList);
  }, [role, currentUserData, clients]);

  const topBrandsData = useMemo(() => {
    if (!currentUserData || !role) return [];

    const movements = getMovementsByRole(role, currentUserData, clients);
    return calculateTopBrandsData(movements);
  }, [role, currentUserData, clients]);

      //DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER


      

  const salesDistributionDataAgents = useMemo(() => {
    if (!currentUserDetails) {
      return { agents: [], data: [] };
    }


    if (role === "admin") {
      const agentsMap = Object.values(clients).reduce((acc, client) => {
        const agentId = client.agent;
        if (!acc[agentId]) {
          const agentDetail = agentDetails[agentId];
          acc[agentId] = {
            id: agentId,
            name: agentDetail ? agentDetail.name : `Agent ${agentId}`,
            clients: [],
          };
        }
        acc[agentId].clients.push(client);
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

      return { agents: [currentUserData as Agent], data };
    }

    return { agents: [], data: [] };
  }, [
    role,
    currentUserDetails,
    agentDetails,
    clients,
    currentUserData,
    isMobile,
  ]);

  const salesDistributionDataClients = useMemo(() => {
    if (!currentUserData) return [];

    if (role === "admin") {
      return calculateSalesDistributionData(Object.values(clients), isMobile);
    } else if (role === "agent") {
      // Use the existing association from agentDetails if available
      const agentData = agents[currentUserData.id];
      return calculateSalesDistributionData(agentData?.clients || [], isMobile);
    }
    return [];
  }, [role, currentUserData, clients, agents, isMobile]);

  const { months, revenueData, ordersData } = useMemo(() => {
    if (!currentUserData)
      return { months: [], revenueData: [], ordersData: [] };

    let clientData: Client[] = [];

    switch (role) {
      case "agent":
        clientData = Object.values(clients).filter(
          (client) => client.agent === currentUserData.id
        );
        break;
      case "client":
        clientData = [currentUserData as Client];
        break;
      case "admin":
        clientData = Object.values(clients);
        break;
    }

    return calculateMonthlyData(clientData);
  }, [role, currentUserData, clients]);

  const yearlyOrders = useMemo(() => {
    return ordersData.reduce<{ [key: number]: number }>(
      (acc, orders, index) => {
        const year = parseInt(months[index].split("-")[0]);
        acc[year] = (acc[year] || 0) + orders;
        return acc;
      },
      {}
    );
  }, [ordersData, months]);

  const yearlyCategories = useMemo(() => {
    return Object.keys(yearlyOrders).map((year) => year);
  }, [yearlyOrders]);

  const yearlyOrdersData = useMemo(() => {
    return yearlyCategories.map((year) => yearlyOrders[parseInt(year)]);
  }, [yearlyCategories, yearlyOrders]);

  const clientComparativeStatistics = useMemo(() => {
    if (!selectedClient || Object.keys(clients).length === 0) {
      return { revenuePercentage: "0.00", ordersPercentage: "0.00" };
    }

    const clientRevenue = parseFloat(selectedClient.totalRevenue);
    const totalRevenueAllClients = parseFloat(
      calculateTotalRevenue(Object.values(clients))
    );
    const revenuePercentage = calculatePercentage(
      clientRevenue,
      totalRevenueAllClients
    );

    const totalOrdersAllClients = Object.values(clients).reduce(
      (sum, client) => sum + client.movements.length,
      0
    );
    const ordersPercentage = calculatePercentage(
      selectedClient.movements.length,
      totalOrdersAllClients
    );

    return { revenuePercentage, ordersPercentage };
  }, [selectedClient, clients]);

  const clientComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedClient || Object.keys(clients).length === 0) {
      return { revenuePercentage: "0.00", ordersPercentage: "0.00" };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const selectedMovements = filterCurrentMonthMovements(
      selectedClient.movements,
      currentMonth,
      currentYear
    );
    const allMovements = Object.values(clients).flatMap((client) =>
      filterCurrentMonthMovements(client.movements, currentMonth, currentYear)
    );

    const selectedMonthlyTotal = calculateRevenue(selectedMovements);
    const allMonthlyTotal = calculateRevenue(allMovements);
    const revenuePercentage = calculatePercentage(
      selectedMonthlyTotal,
      allMonthlyTotal
    );
    const ordersPercentage = calculatePercentage(
      selectedMovements.length,
      allMovements.length
    );

    return { revenuePercentage, ordersPercentage };
  }, [selectedClient, clients]);


  const agentComparativeStatistics = useMemo(() => {
    if (!selectedAgent || Object.keys(clients).length === 0) {
      return { revenuePercentage: "0.00", ordersPercentage: "0.00" };
    }

    const agentClients = Object.values(clients).filter(
      (client) => client.agent === selectedAgent.id
    );

    const agentRevenue = parseFloat(calculateTotalRevenue(agentClients));
    const totalRevenueAllClients = parseFloat(
      calculateTotalRevenue(Object.values(clients))
    );
    const revenuePercentage = calculatePercentage(
      agentRevenue,
      totalRevenueAllClients
    );

    const agentOrders = calculateTotalOrders(agentClients);
    const totalOrdersAllClients = calculateTotalOrders(Object.values(clients));
    const ordersPercentage = calculatePercentage(
      agentOrders,
      totalOrdersAllClients
    );

    return { revenuePercentage, ordersPercentage };
  }, [selectedAgent, clients]);

  const agentComparativeStatisticsMonthly = useMemo(() => {
    if (!selectedAgent || Object.keys(clients).length === 0) {
      return { revenuePercentage: "0.00", ordersPercentage: "0.00" };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const agentClients = Object.values(clients).filter(
      (client) => client.agent === selectedAgent.id
    );

    const selectedMonthlyTotal = agentClients.reduce(
      (total, client) =>
        total +
        calculateRevenue(
          filterCurrentMonthMovements(
            client.movements,
            currentMonth,
            currentYear
          )
        ),
      0
    );

    const allMonthlyTotal = Object.values(clients).reduce(
      (total, client) =>
        total +
        calculateRevenue(
          filterCurrentMonthMovements(
            client.movements,
            currentMonth,
            currentYear
          )
        ),
      0
    );

    const revenuePercentage = calculatePercentage(
      selectedMonthlyTotal,
      allMonthlyTotal
    );

    const selectedOrdersTotal = agentClients.reduce(
      (total, client) =>
        total +
        filterCurrentMonthMovements(client.movements, currentMonth, currentYear)
          .length,
      0
    );

    const allOrdersTotal = Object.values(clients).reduce(
      (total, client) =>
        total +
        filterCurrentMonthMovements(client.movements, currentMonth, currentYear)
          .length,
      0
    );

    const ordersPercentage = calculatePercentage(
      selectedOrdersTotal,
      allOrdersTotal
    );

    return { revenuePercentage, ordersPercentage };
  }, [selectedAgent, clients]);

  return {
    details: currentUserData,
    selectedClient,
    selectedAgent,
    selectClient: selectClientHandler,
    selectAgent: selectAgentHandler,
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
    error: localError || error, // Prefer local error if set, otherwise Redux error
  };
};

export default useStats;
