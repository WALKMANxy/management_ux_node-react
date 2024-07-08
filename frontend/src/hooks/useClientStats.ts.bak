import { useCallback, useEffect, useMemo, useState } from "react";
import { Client, Movement } from "../models/models";
import { useGetClientsQuery } from "../services/api";
import {
  calculateClientSalesDistributionData,
  calculateClientTopBrandsData,
  calculateClientTotalOrders,
  calculateClientTotalRevenue,
} from "../utils/dataUtils";

const useClientStats = (clientId: string | null, isMobile: boolean) => {
  const { data: clientsData = [], isLoading, error } = useGetClientsQuery();
  const [clientDetails, setClientDetails] = useState<Client | null>(null);

  useEffect(() => {
    if (clientId && clientsData.length > 0) {
      const client = clientsData.find((client) => client.id === clientId);
      setClientDetails(client || null);
    }
  }, [clientId, clientsData]);

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

  const totalRevenue = useMemo(
    () =>
      clientDetails
        ? parseFloat(calculateClientTotalRevenue([clientDetails]))
        : 0,
    [clientDetails]
  );

  const totalOrders = useMemo(
    () => (clientDetails ? calculateClientTotalOrders([clientDetails]) : 0),
    [clientDetails]
  );

  const topBrandsData = useMemo(
    () => (clientDetails ? calculateClientTopBrandsData([clientDetails]) : []),
    [clientDetails]
  );

  const salesDistributionData = useMemo(
    () =>
      clientDetails
        ? calculateClientSalesDistributionData([clientDetails], isMobile)
        : [],
    [clientDetails, isMobile]
  );

  return {
    clientDetails,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    totalRevenue,
    totalOrders,
    topBrandsData,
    salesDistributionData,
    isLoading,
    error,
  };
};

export default useClientStats;
