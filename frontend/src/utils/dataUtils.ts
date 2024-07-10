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
export const calculateSalesDistributionDataForAgents = (
  agents: Agent[],
  isMobile: boolean
): { label: string; value: number }[] => {
  const agentSalesData = agents.map(agent => {
    const totalRevenue = agent.clients.reduce((sum, client) => {
      const revenue = parseFloat(client.totalRevenue);
      return sum + revenue;
    }, 0);
    return { label: agent.name, value: totalRevenue };
  });

  // Sort and slice based on the isMobile parameter
  const sortedData = agentSalesData.sort((a, b) => b.value - a.value);
  return isMobile ? sortedData.slice(0, 8) : sortedData.slice(0, 25);
};

// Calculate total orders for a list of clients
// Helper function to group movements by order ID
const groupByOrderId = (movements: Movement[]): { [orderId: string]: Movement[] } => {
  return movements.reduce((acc, movement) => {
    const orderId = movement.id;
    if (!acc[orderId]) {
      acc[orderId] = [];
    }
    acc[orderId].push(movement);
    return acc;
  }, {} as { [orderId: string]: Movement[] });
};

// Calculate total orders for a list of clients based on unique order IDs
export const calculateTotalOrders = (clients: Client[]): number => {
  const allMovements = clients.flatMap(client => client.movements);
  const groupedMovements = groupByOrderId(allMovements);
  return Object.keys(groupedMovements).length;
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
    .map((brand, index) => ({
      label: brand,
      value: brandCount[brand],
      key: `${brand}-${index}`, // Ensure unique keys by adding an index
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
  const allMovements = clients.flatMap(client => client.movements);

  const groupedByOrderId = groupByOrderId(allMovements);

  const monthlyData = Object.values(groupedByOrderId).reduce((acc, movements) => {
    const uniqueMovement = movements[0]; // Use the first movement as a representative for the order
    const monthYear = getMonthYear(uniqueMovement.dateOfOrder);

    if (monthYear === "Invalid Date") {
      console.error("Skipping movement with invalid date:", uniqueMovement);
      return acc;
    }

    const movementRevenue = movements.reduce(
      (sum, movement) => sum + movement.details.reduce((detailSum, detail) => detailSum + parseFloat(detail.priceSold), 0),
      0
    );

    if (!acc[monthYear]) {
      acc[monthYear] = { revenue: 0, orders: 0 };
    }

    acc[monthYear].revenue += movementRevenue;
    acc[monthYear].orders += 1; // Each group of movements with the same orderId counts as one order

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
