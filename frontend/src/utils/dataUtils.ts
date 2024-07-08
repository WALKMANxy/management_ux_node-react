// src/utils/dataUtils.ts
import { Client, Movement } from "../models/models";

// Calculate total revenue for a list of clients
export const calculateTotalRevenue = (clients: Client[]): string => {
  return clients
    .reduce((total, client) => total + parseFloat(client.totalRevenue), 0)
    .toFixed(2);
};

// Calculate total orders for a list of clients
export const calculateTotalOrders = (clients: Client[]): number => {
  return clients.reduce((total, client) => total + client.totalOrders, 0);
};

// Calculate top brands data for a list of clients
export const calculateTopBrandsData = (
  clients: Client[]
): { label: string; value: number }[] => {
  const brandCount: { [key: string]: number } = {};
  clients.forEach((client) => {
    client.movements.forEach((movement) => {
      movement.details.forEach((detail) => {
        if (detail.brand) {
          if (!brandCount[detail.brand]) {
            brandCount[detail.brand] = 0;
          }
          brandCount[detail.brand] += 1;
        }
      });
    });
  });
  return Object.keys(brandCount)
    .map((brand) => ({
      label: brand,
      value: brandCount[brand],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
};

// Calculate sales distribution data for a list of clients
export const calculateSalesDistributionData = (
  clients: Client[],
  isMobile: boolean
): { label: string; value: number }[] => {
  const topClients = [...clients]
    .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))
    .slice(0, isMobile ? 8 : 25);
  return topClients.map((client) => ({
    label: client.name,
    value: parseFloat(client.totalRevenue),
  }));
};

// Calculate total revenue for a specific agent's clients
export const calculateAgentTotalRevenue = (clients: Client[]): string => {
  return calculateTotalRevenue(clients);
};

// Calculate total orders for a specific agent's clients
export const calculateAgentTotalOrders = (clients: Client[]): number => {
  return clients.reduce((total, client) => {
    const clientOrders = client.movements.length; // Each movement is an order
    return total + clientOrders;
  }, 0);
};

// Calculate top brands data for a specific agent's clients
export const calculateAgentTopBrandsData = (
  clients: Client[]
): { label: string; value: number }[] => {
  return calculateTopBrandsData(clients);
};

// Calculate sales distribution data for a specific agent's clients
export const calculateAgentSalesDistributionData = (
  clients: Client[],
  isMobile: boolean
): { label: string; value: number }[] => {
  return calculateSalesDistributionData(clients, isMobile);
};

// Calculate total revenue for a specific client
export const calculateClientTotalRevenue = (clients: Client[]): string => {
  return calculateTotalRevenue(clients);
};

// Calculate total orders for a specific client
export const calculateClientTotalOrders = (clients: Client[]): number => {
  return calculateTotalOrders(clients);
};

// Calculate top brands data for a specific client
export const calculateClientTopBrandsData = (
  clients: Client[]
): { label: string; value: number }[] => {
  return calculateTopBrandsData(clients);
};

// Calculate sales distribution data for a specific client
export const calculateClientSalesDistributionData = (
  clients: Client[],
  isMobile: boolean
): { label: string; value: number }[] => {
  return calculateSalesDistributionData(clients, isMobile);
};

export const calculateMonthlyOrders = (movements: Movement[]): number => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  return movements.filter((movement) => {
    const movementDate = new Date(movement.dateOfOrder);
    return (
      movementDate.getMonth() + 1 === currentMonth &&
      movementDate.getFullYear() === currentYear
    );
  }).length;
};

export const calculateMonthlyRevenue = (movements: Movement[]): string => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const totalRevenue = movements
    .filter((movement) => {
      const movementDate = new Date(movement.dateOfOrder);
      return (
        movementDate.getMonth() + 1 === currentMonth &&
        movementDate.getFullYear() === currentYear
      );
    })
    .reduce((total, movement) => {
      return (
        total +
        movement.details.reduce(
          (sum, detail) => sum + parseFloat(detail.priceSold),
          0
        )
      );
    }, 0)
    .toFixed(2);
  return totalRevenue;
};

export const currencyFormatter = (value: any): string => {
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) {
    return "";
  }
  return `€${numberValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
};

export const numberComparator = (valueA: number, valueB: number) => {
  return valueA - valueB;
};

export const getTrend = (percentage: string | number) =>
  parseFloat(`${percentage}`) > 50 ? "up" : "down";
