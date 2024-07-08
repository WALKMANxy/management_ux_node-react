import { format, parseISO } from "date-fns";
import { Agent, Client, Movement } from "../models/models";

// Helper function to get month and year from a date string
export const getMonthYear = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, "yyyy-MM");
};

// Calculate total revenue for a list of clients
export const calculateTotalRevenue = (clients: Client[]): string => {
  return clients
    .reduce((total, client) => total + parseFloat(client.totalRevenue), 0)
    .toFixed(2);
};

// Calculate sales distribution data for agents
// dataUtils.ts

export const calculateSalesDistributionDataForAgents = (
  agents: Agent[],
  isMobile: boolean
): { label: string; value: number }[] => {
  const agentSalesData = agents.map(agent => {
    const totalRevenue = agent.clients.reduce((sum, client) => {
      const revenue = parseFloat(client.totalRevenue);
      console.log(`Agent: ${agent.name}, Client: ${client.name}, Revenue: ${revenue}`);
      return sum + revenue;
    }, 0);
    console.log(`Agent: ${agent.name}, Total Revenue: ${totalRevenue}`);
    return { label: agent.name, value: totalRevenue };
  });

  // Sort and slice based on the isMobile parameter
  const sortedData = agentSalesData.sort((a, b) => b.value - a.value);
  console.log("Sorted data: ", sortedData);
  return isMobile ? sortedData.slice(0, 8) : sortedData.slice(0, 25);
};

// Calculate total orders for a list of clients
export const calculateTotalOrders = (clients: Client[]): number => {
  //console.log("Calculating total orders...");
  //console.log("Number of clients:", clients.length);
  const totalOrders = clients.reduce((total, client) => {
    //console.log("Client:", client.name, "Orders:", client.totalOrders);
    return total + client.totalOrders;
  }, 0);
  //console.log("Total orders:", totalOrders);
  return totalOrders;
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

// Calculate monthly orders from movements
export const calculateMonthlyOrders = (movements: Movement[]): number => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  //console.log("Calculating monthly orders...");
  //console.log("Current month:", currentMonth);
  //console.log("Current year:", currentYear);
  const filteredMovements = movements.filter((movement) => {
    const movementDate = new Date(movement.dateOfOrder);
    return (
      movementDate.getMonth() + 1 === currentMonth &&
      movementDate.getFullYear() === currentYear
    );
  });
  //console.log("Number of filtered movements:", filteredMovements.length);
  return filteredMovements.length;
};

// Calculate monthly revenue from movements
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

// Calculate monthly data (revenue and orders) from clients
export const calculateMonthlyData = (clients: Client[]) => {
  const monthlyData = clients.reduce((acc, client) => {
    client.movements.forEach((movement) => {
      const monthYear = getMonthYear(movement.dateOfOrder);
      if (monthYear === "Invalid Date") {
        console.error("Skipping movement with invalid date:", movement);
        return;
      }
      const movementRevenue = movement.details.reduce(
        (sum, detail) => sum + parseFloat(detail.priceSold),
        0
      );
      const movementOrders = movement.details.length;
      if (!acc[monthYear]) {
        acc[monthYear] = { revenue: 0, orders: 0 };
      }
      acc[monthYear].revenue += movementRevenue;
      acc[monthYear].orders += movementOrders;
    });
    return acc;
  }, {} as { [key: string]: { revenue: number; orders: number } });

  const months = Object.keys(monthlyData).sort();
  const revenueData = months.map((month) => monthlyData[month].revenue);
  const ordersData = months.map((month) => monthlyData[month].orders);

  return { months, revenueData, ordersData };
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
