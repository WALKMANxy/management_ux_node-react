// src/utils/dataUtils.ts
import { Client } from "../models/models";

export const calculateTotalRevenue = (clients: Client[]): string => {
  return clients
    .reduce((total, client) => total + parseFloat(client.totalRevenue), 0)
    .toFixed(2);
};

export const calculateTotalOrders = (clients: Client[]): number => {
  return clients.reduce((total, client) => total + client.totalOrders, 0);
};

export const calculateTopBrandsData = (clients: Client[]): { label: string; value: number }[] => {
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

export const calculateSalesDistributionData = (clients: Client[], isMobile: boolean): { label: string; value: number }[] => {
  const topClients = [...clients]
    .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))
    .slice(0, isMobile ? 5 : 25);
  return topClients.map((client) => ({
    label: client.name,
    value: parseFloat(client.totalRevenue),
  }));
};
