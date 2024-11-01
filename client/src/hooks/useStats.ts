//src/hooks/useStats.ts
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
  calculateNetRevenue,
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

interface SalesDistributionData {
  agents: Agent[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

interface ComparativeStatistics {
  revenuePercentage: string;
  ordersPercentage: string;
}

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
  const { selectedClientId, selectedAgentId } = useAppSelector<
    RootState,
    DataSliceState
  >((state) => state.data);

  // Precompute current date details
  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Precompute maps for agents and their clients
  const agentsMap = useMemo<Map<string, Agent>>(() => {
    const map = new Map<string, Agent>();

    Object.values(agents).forEach((agent) => {
      map.set(agent.id, agent);
    });

    return map;
  }, [agents]);

  const agentClientsMap = useMemo<Map<string, Client[]>>(() => {
    const map = new Map<string, Client[]>();

    Object.values(clients).forEach((client) => {
      const agentId = client.agent;
      if (!map.has(agentId)) {
        map.set(agentId, []);
      }
      map.get(agentId)!.push(client);
    });

    return map;
  }, [clients]);

  const salesDistributionDataClients = useMemo(() => {
    if (!currentUserData) return [];

    return calculateSalesDistributionData(Object.values(clients), isMobile);
  }, [currentUserData, clients, isMobile]);

  const selectedClient = useMemo(
    () => (selectedClientId ? clients[selectedClientId] : null),
    [clients, selectedClientId]
  );

  const selectedAgent = useMemo(
    () => (selectedAgentId ? agents[selectedAgentId] : null),
    [agents, selectedAgentId]
  );

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
    return calculateMonthlyRevenue(movements);
  }, []);

  const calculateTotalSpentThisYear = useCallback(
    (movements: Movement[]) => {
      return calculateTotalSpentForYear(movements, currentYear);
    },
    [currentYear]
  );

  const calculateTotalSpentThisYearForAgents = useCallback(
    (clients: Client[]) => {
      return calculateTotalSpentForYearForClients(clients, currentYear);
    },
    [currentYear]
  );

  const calculateTopArticleType = useCallback(
    (movements: Movement[]): TopArticleType[] => {
      return calculateTopArticleTypeUtil(movements);
    },
    []
  );

  const calculatePercentageCached = useMemo(() => {
    const cache = new Map<string, string>();

    return (part: number, total: number): string => {
      const key = `${part}-${total}`;
      if (cache.has(key)) return cache.get(key)!;

      const percentage =
        total === 0 ? "0.00" : calculatePercentage(part, total);
      cache.set(key, percentage);
      return percentage;
    };
  }, []);

  // Sales Distribution Data for Agents
  const salesDistributionDataAgents = useMemo<SalesDistributionData>(() => {
    if (!currentUserDetails) {
      return { agents: [], data: [] };
    }

    if (role === "admin") {
      const agentsList: Agent[] = [];

      agentClientsMap.forEach((clientsList, agentId) => {
        const agentDetail = agentsMap.get(agentId);
        agentsList.push({
          id: agentId,
          name: agentDetail ? agentDetail.name : `Agent ${agentId}`,
          clients: clientsList,
        });
      });

      const data = calculateSalesDistributionDataForAgents(
        agentsList,
        isMobile
      );

      return { agents: agentsList, data };
    } else if (role === "agent") {
      const agentClients = agentClientsMap.get(currentUserDetails.id) || [];

      const data = calculateSalesDistributionData(agentClients, isMobile);

      return { agents: [currentUserData as Agent], data };
    }

    return { agents: [], data: [] };
  }, [
    role,
    currentUserDetails,
    agentsMap,
    agentClientsMap,
    currentUserData,
    isMobile,
  ]);

  // Monthly Revenue and Orders Data
  const { months, revenueData, netRevenueData, ordersData } = useMemo(() => {
    if (!currentUserData)
      return {
        months: [],
        revenueData: [],
        netRevenueData: [],
        ordersData: [],
      };

    let clientData: Client[] = [];

    switch (role) {
      case "agent":
        clientData = agentClientsMap.get(currentUserData.id) || [];
        break;
      case "client":
        clientData = [currentUserData as Client];
        break;
      case "admin":
        clientData = Object.values(clients);
        break;
      default:
        clientData = [];
    }

    return calculateMonthlyData(clientData);
  }, [role, currentUserData, agentClientsMap, clients]);

  // Yearly Orders Data
  const { yearlyCategories, yearlyOrdersData } = useMemo(() => {
    const ordersByYear: Record<number, number> = {};

    for (let i = 0; i < ordersData.length; i++) {
      const year = parseInt(months[i].split("-")[0], 10);
      ordersByYear[year] = (ordersByYear[year] || 0) + ordersData[i];
    }

    const categories = Object.keys(ordersByYear)
      .map(Number)
      .sort((a, b) => a - b)
      .map(String);
    const data = categories.map((year) => ordersByYear[Number(year)]);

    return { yearlyCategories: categories, yearlyOrdersData: data };
  }, [ordersData, months]);

  // Comparative Statistics for Clients
  const clientComparativeStatistics = useMemo<ComparativeStatistics>(() => {
    if (!selectedClient || Object.keys(clients).length === 0) {
      return { revenuePercentage: "0.00", ordersPercentage: "0.00" };
    }

    const clientRevenue = parseFloat(selectedClient.totalRevenue);
    const totalRevenueAllClients = calculateTotalRevenue(
      Object.values(clients)
    );
    const revenuePercentage = calculatePercentageCached(
      clientRevenue,
      totalRevenueAllClients
    );

    const totalOrdersAllClients = Object.values(clients).reduce(
      (sum, client) => sum + client.movements.length,
      0
    );
    const ordersPercentage = calculatePercentageCached(
      selectedClient.movements.length,
      totalOrdersAllClients
    );

    return { revenuePercentage, ordersPercentage };
  }, [selectedClient, clients, calculatePercentageCached]);

  // Monthly Comparative Statistics for Clients
  const clientComparativeStatisticsMonthly =
    useMemo<ComparativeStatistics>(() => {
      if (!selectedClient || Object.keys(clients).length === 0) {
        return { revenuePercentage: "0.00", ordersPercentage: "0.00" };
      }

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
      const revenuePercentage = calculatePercentageCached(
        selectedMonthlyTotal,
        allMonthlyTotal
      );
      const ordersPercentage = calculatePercentageCached(
        selectedMovements.length,
        allMovements.length
      );

      return { revenuePercentage, ordersPercentage };
    }, [
      selectedClient,
      clients,
      currentMonth,
      currentYear,
      calculatePercentageCached,
    ]);

  // Comparative Statistics for Agents
  const agentComparativeStatistics = useMemo<ComparativeStatistics>(() => {
    if (!selectedAgent || Object.keys(clients).length === 0) {
      return { revenuePercentage: "0.00", ordersPercentage: "0.00" };
    }

    const agentClients = agentClientsMap.get(selectedAgent.id) || [];

    const agentRevenue = calculateTotalRevenue(agentClients);
    const totalRevenueAllClients = calculateTotalRevenue(
      Object.values(clients)
    );
    const revenuePercentage = calculatePercentageCached(
      agentRevenue,
      totalRevenueAllClients
    );

    const agentOrders = calculateTotalOrders(agentClients);
    const totalOrdersAllClients = calculateTotalOrders(Object.values(clients));
    const ordersPercentage = calculatePercentageCached(
      agentOrders,
      totalOrdersAllClients
    );

    return { revenuePercentage, ordersPercentage };
  }, [selectedAgent, clients, agentClientsMap, calculatePercentageCached]);

  // Monthly Comparative Statistics for Agents
  const agentComparativeStatisticsMonthly =
    useMemo<ComparativeStatistics>(() => {
      if (!selectedAgent || Object.keys(clients).length === 0) {
        return { revenuePercentage: "0.00", ordersPercentage: "0.00" };
      }

      const agentClients = agentClientsMap.get(selectedAgent.id) || [];

      const selectedMonthlyTotal = agentClients.reduce((total, client) => {
        const movements = filterCurrentMonthMovements(
          client.movements,
          currentMonth,
          currentYear
        );
        return total + calculateRevenue(movements);
      }, 0);

      const allMonthlyTotal = Object.values(clients).reduce((total, client) => {
        const movements = filterCurrentMonthMovements(
          client.movements,
          currentMonth,
          currentYear
        );
        return total + calculateRevenue(movements);
      }, 0);

      const revenuePercentage = calculatePercentageCached(
        selectedMonthlyTotal,
        allMonthlyTotal
      );

      const selectedOrdersTotal = agentClients.reduce((total, client) => {
        return (
          total +
          filterCurrentMonthMovements(
            client.movements,
            currentMonth,
            currentYear
          ).length
        );
      }, 0);

      const allOrdersTotal = Object.values(clients).reduce((total, client) => {
        return (
          total +
          filterCurrentMonthMovements(
            client.movements,
            currentMonth,
            currentYear
          ).length
        );
      }, 0);

      const ordersPercentage = calculatePercentageCached(
        selectedOrdersTotal,
        allOrdersTotal
      );

      return { revenuePercentage, ordersPercentage };
    }, [
      selectedAgent,
      clients,
      agentClientsMap,
      currentMonth,
      currentYear,
      calculatePercentageCached,
    ]);

  // Top Brands Data
  const topBrandsData = useMemo(() => {
    if (!currentUserData || !role) return [];

    const movements = getMovementsByRole(role, currentUserData, clients);
    return calculateTopBrandsData(movements);
  }, [role, currentUserData, clients]);

  // Top Article Types
  const topArticleTypes = useMemo<TopArticleType[]>(() => {
    if (!currentUserData || !role) return [];

    const movements = getMovementsByRole(role, currentUserData, clients);
    return calculateTopArticleTypeUtil(movements);
  }, [role, currentUserData, clients]);

  // Total Revenue and Orders
  const totalRevenue = useMemo<number>(() => {
    if (!currentUserData || !role) return 0;

    const clientList = getAdjustedClients(role, currentUserData, clients);
    return calculateTotalRevenue(clientList);
  }, [role, currentUserData, clients]);

  // Total Revenue and Orders
  const totalNetRevenue = useMemo<number>(() => {
    if (!currentUserData || !role) return 0;

    const clientList = getAdjustedClients(role, currentUserData, clients);
    return calculateNetRevenue(clientList);
  }, [role, currentUserData, clients]);

  const totalOrders = useMemo<number>(() => {
    if (!currentUserData || !role) return 0;

    const clientList = getAdjustedClients(role, currentUserData, clients);
    return calculateTotalOrders(clientList);
  }, [role, currentUserData, clients]);

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
    topArticleTypes,
    salesDistributionDataClients,
    salesDistributionDataAgents,
    months,
    revenueData,
    netRevenueData,
    ordersData,
    yearlyCategories,
    yearlyOrdersData,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
    totalNetRevenue,
    error: localError || error,
  };
};

export default useStats;
