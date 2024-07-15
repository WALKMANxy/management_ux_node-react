import { format, parseISO } from "date-fns";
import { Agent, Client, Movement } from "../models/models";
import { ignoreArticleNames } from "./constants";

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

export const calculateNetRevenue = (clients: Client[]): string => {
  return clients
    .reduce((netTotal, client) => {
      const clientNetRevenue = client.movements.reduce((sum, movement) => {
        const movementNetRevenue = movement.details.reduce(
          (detailSum, detail) => {
            const priceSold = parseFloat(detail.priceSold) || 0;
            const priceBought = Math.abs((parseFloat(detail.priceBought)) || 0) * (detail.quantity || 0);

            /*  // Log details for debugging
             console.log("Detail:", detail);
             console.log("priceSold:", priceSold);
             console.log("priceBought:", priceBought);
             console.log("quantity:", Math.abs(detail.quantity || 0));
             console.log("netRevenue for this detail:", detailSum + priceSold - priceBought);
 
 */
            return detailSum + priceSold - priceBought;
          },
          0
        );
       // Log movementNetRevenue for debugging
       //console.log("movementNetRevenue:", movementNetRevenue);
       return sum + movementNetRevenue;
     }, 0);

     // Log clientNetRevenue for debugging
     //console.log("clientNetRevenue:", clientNetRevenue);
      return netTotal + clientNetRevenue;
    }, 0)
    .toFixed(2);
};


// Calculate sales distribution data for agents
export const calculateSalesDistributionDataForAgents = (
  agents: Agent[],
  isMobile: boolean
): { label: string; value: number }[] => {
  const agentSalesData = agents.map((agent) => {
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
const groupByOrderId = (
  movements: Movement[]
): { [orderId: string]: Movement[] } => {
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
  const allMovements = clients.flatMap((client) => client.movements);
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
  //console.log("Calculating Sales Distribution Data for Clients:", clients);

  const aggregatedClients = clients.reduce((acc, client) => {
    if (!acc[client.id]) {
      acc[client.id] = {
        ...client,
        totalRevenue: parseFloat(client.totalRevenue),
      };
    } else {
      acc[client.id].totalRevenue += parseFloat(client.totalRevenue);
    }
    return acc;
  }, {} as { [key: string]: Omit<Client, "totalRevenue"> & { totalRevenue: number } });

  const topClients = Object.values(aggregatedClients)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, isMobile ? 8 : 25);

  //console.log("Top Clients:", topClients);

  return topClients.map((client) => ({
    label: client.name,
    value: client.totalRevenue,
  }));
};

export const calculateTotalQuantitySold = (
  movements: Movement[]
): { [key: string]: number } => {
  return movements.reduce((acc, movement) => {
    movement.details.forEach((detail) => {
      if (!acc[detail.articleId]) {
        acc[detail.articleId] = 0;
      }
      acc[detail.articleId] += detail.quantity;
    });
    return acc;
  }, {} as { [key: string]: number });
};

export const calculateTotalSpentForYear = (
  movements: Movement[],
  year: number
): string => {
  const totalSpent = movements
    .filter((movement) => new Date(movement.dateOfOrder).getFullYear() === year)
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
};

export const calculateTotalSpentForYearForClients = (
  clients: Client[],
  year: number
): string => {
  const totalSpent = clients
    .reduce((total, client) => {
      const clientTotal = calculateTotalSpentForYear(client.movements, year);
      return total + parseFloat(clientTotal);
    }, 0)
    .toFixed(2);
  return totalSpent;
};

export const calculateTopArticleTypeUtil = (
  movements: Movement[]
): { id: string; name: string; quantity: number }[] => {
  const typeCount: {
    [key: string]: { id: string; name: string; quantity: number };
  } = {};

  // Iterate over each movement
  movements.forEach((movement) => {
    // Iterate over each detail in the movement
    movement.details.forEach((detail) => {
      if (!ignoreArticleNames.has(detail.name)) {
        // Initialize the typeCount entry if it doesn't exist
        if (!typeCount[detail.name]) {
          typeCount[detail.name] = {
            id: detail.articleId,
            name: detail.name,
            quantity: 0,
          };
        }
        // Accumulate the quantity sold
        typeCount[detail.name].quantity += detail.quantity;
      }
    });
  });

  // Sort the articles by quantity in descending order and return the top 5
  return Object.values(typeCount)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
};

// Calculate monthly revenue from movements
export const calculateMonthlyRevenue = (
  movements: Movement[]
): { totalRevenue: string; totalNetRevenue: string } => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { totalRevenue, totalNetRevenue } = movements
    .filter((movement) => {
      const movementDate = new Date(movement.dateOfOrder);
      return (
        movementDate.getMonth() + 1 === currentMonth &&
        movementDate.getFullYear() === currentYear
      );
    })
    .reduce(
      (totals, movement) => {
        const movementRevenue = movement.details.reduce(
          (sum, detail) => sum + parseFloat(detail.priceSold),
          0
        );
        const movementCost = movement.details.reduce(
          (sum, detail) => sum + parseFloat(detail.priceBought),
          0
        );
        totals.totalRevenue += movementRevenue;
        totals.totalNetRevenue += movementRevenue - movementCost;
        return totals;
      },
      { totalRevenue: 0, totalNetRevenue: 0 }
    );

  return {
    totalRevenue: totalRevenue.toFixed(2),
    totalNetRevenue: totalNetRevenue.toFixed(2),
  };
};

// Calculate monthly data (revenue and orders) from clients
export const calculateMonthlyData = (clients: Client[]) => {
  const allMovements = clients.flatMap((client) => client.movements);

  const groupedByOrderId = groupByOrderId(allMovements);

  const monthlyData = Object.values(groupedByOrderId).reduce(
    (acc, movements) => {
      const uniqueMovement = movements[0]; // Use the first movement as a representative for the order
      const monthYear = getMonthYear(uniqueMovement.dateOfOrder);

      if (monthYear === "Invalid Date") {
        console.error("Skipping movement with invalid date:", uniqueMovement);
        return acc;
      }

      const movementRevenue = movements.reduce(
        (sum, movement) =>
          sum +
          movement.details.reduce(
            (detailSum, detail) => detailSum + parseFloat(detail.priceSold),
            0
          ),
        0
      );

      const movementCost = movements.reduce(
        (sum, movement) =>
          sum +
          movement.details.reduce(
            (detailSum, detail) => detailSum + parseFloat(detail.priceBought),
            0
          ),
        0
      );

      if (!acc[monthYear]) {
        acc[monthYear] = { revenue: 0, netRevenue: 0, orders: 0 };
      }

      acc[monthYear].revenue += movementRevenue;
      acc[monthYear].netRevenue += movementRevenue - movementCost;
      acc[monthYear].orders += 1; // Each group of movements with the same orderId counts as one order

      return acc;
    },
    {} as {
      [key: string]: { revenue: number; netRevenue: number; orders: number };
    }
  );

  const months = Object.keys(monthlyData).sort();
  const revenueData = months.map((month) => monthlyData[month].revenue);
  const netRevenueData = months.map((month) => monthlyData[month].netRevenue);
  const ordersData = months.map((month) => monthlyData[month].orders);

  return { months, revenueData, netRevenueData, ordersData };
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
