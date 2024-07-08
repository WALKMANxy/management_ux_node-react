import { useCallback, useEffect, useMemo, useState } from "react";
import { Agent, Client, Movement } from "../models/models";
import { useGetClientsQuery } from "../services/api";
import { calculateMonthlyData } from "../utils/dataLoader";
import {
  calculateMonthlyRevenue,
  calculateSalesDistributionData,
  calculateTopBrandsData,
  calculateTotalOrders,
  calculateTotalRevenue,
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
      console.log("Agent details set:", agent); // Debug statement
    }
  }, [isLoading, clientsData, agentId]);

  const calculateTotalSpentThisMonth = useCallback((movements: Movement[]) => {
    const totalSpent = calculateMonthlyRevenue(movements);
    console.log("Total spent this month:", totalSpent); // Debug statement
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
    console.log("Total spent this year:", totalSpent); // Debug statement
    return totalSpent;
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
    console.log("Top article types:", sortedArticles.slice(0, 5)); // Debug statement
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
          console.log("Selected client set:", client); // Debug statement
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
        ? parseFloat(calculateTotalRevenue(agentDetails.clients))
        : 0,
    [agentDetails]
  );

  const totalOrders = useMemo(
    () => (agentDetails ? calculateTotalOrders(agentDetails.clients) : 0),
    [agentDetails]
  );

  const topBrandsData = useMemo(
    () =>
      agentDetails ? calculateTopBrandsData(agentDetails.clients) : [],
    [agentDetails]
  );

  const salesDistributionData = useMemo(
    () =>
      agentDetails
        ? calculateSalesDistributionData(agentDetails.clients, isMobile)
        : [],
    [agentDetails, isMobile]
  );

  const { months, revenueData, ordersData } = useMemo(
    () =>
      agentDetails
        ? calculateMonthlyData(agentDetails.clients)
        : { months: [], revenueData: [], ordersData: [] },
    [agentDetails]
  );

  useEffect(() => {
    console.log("Months data:", months); // Debug statement
    console.log("Revenue data:", revenueData); // Debug statement
    console.log("Orders data:", ordersData); // Debug statement
  }, [months, revenueData, ordersData]);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalRevenueAllClients = useMemo(
    () =>
      clientsData
        ? clientsData.reduce((sum, client) => sum + parseFloat(client.totalRevenue), 0)
        : 0,
    [clientsData]
  );

  const totalOrdersAllClients = useMemo(
    () =>
      clientsData
        ? clientsData.reduce((sum, client) => sum + client.movements.length, 0)
        : 0,
    [clientsData]
  );

  const clientComparativeStatistics = useMemo(() => {
    if (!selectedClient || !clientsData) return { revenuePercentage: 0, ordersPercentage: 0 };

    const clientRevenue = parseFloat(selectedClient.totalRevenue);
    const totalRevenueAllClients = clientsData.reduce((sum, client) => sum + parseFloat(client.totalRevenue), 0);

    return {
      revenuePercentage: ((clientRevenue / totalRevenueAllClients) * 100).toFixed(2),
      ordersPercentage: ((selectedClient.movements.length / totalOrdersAllClients) * 100).toFixed(2),
    };
  }, [selectedClient, clientsData, totalOrdersAllClients]);

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
    selectedClientTopBrandsData,
    salesDistributionData,
    months,
    revenueData,
    ordersData,
    yearlyCategories,
    yearlyOrdersData,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    isLoading,
    error,
  };
};

export default useAgentStats;
