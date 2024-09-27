import dayjs from "dayjs";
import { Movement } from "../models/dataModels";
import { Admin, Agent, Client, UserRole } from "../models/entityModels";
import { BrandData } from "../models/propsModels";
import { ignoreArticleNames } from "./constants";

// Helper function to get month and year from a date string
export const getMonthYear = (dateString: string) => {
  const date = dayjs(dateString);
  return date.format("YYYY-MM");
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
            const priceBought =
              Math.abs(parseFloat(detail.priceBought) || 0) *
              (detail.quantity || 0);

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

export const calculateTopBrandsData = (movements: Movement[]): BrandData[] => {
  // Ensure the return type is BrandData[]
  const brandCount: { [key: string]: { name: string; quantity: number } } = {};

  // Iterate over each movement
  movements.forEach((movement) => {
    // Iterate over each detail in the movement
    movement.details.forEach((detail) => {
      if (detail.brand && !ignoreArticleNames.has(detail.name)) {
        // Normalize the brand name
        const normalizedBrand = detail.brand.trim().toLowerCase();
        // Initialize the brandCount entry if it doesn't exist
        if (!brandCount[normalizedBrand]) {
          brandCount[normalizedBrand] = {
            name: detail.brand, // Use the original brand name for display
            quantity: 0,
          };
        }
        // Accumulate the quantity sold
        brandCount[normalizedBrand].quantity += detail.quantity;
      }
    });
  });

  // Sort the brands by quantity in descending order and return the top 10
  return Object.values(brandCount)
    .map((brand, index) => ({
      id: `${brand.name}-${index}`, // Ensure unique keys by adding an index
      label: brand.name,
      value: brand.quantity,
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

      const movementNetRevenue = movements.reduce(
        (sum, movement) =>
          sum +
          movement.details.reduce((detailSum, detail) => {
            const priceSold = parseFloat(detail.priceSold) || 0;
            const priceBought =
              Math.abs(parseFloat(detail.priceBought) || 0) *
              (detail.quantity || 0);
            return detailSum + priceSold - priceBought;
          }, 0),
        0
      );

      if (!acc[monthYear]) {
        acc[monthYear] = { revenue: 0, netRevenue: 0, orders: 0 };
      }

      acc[monthYear].revenue += movementRevenue;
      acc[monthYear].netRevenue += movementNetRevenue;
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

// Calculate total quantity for a movement
export const calculateTotalQuantity = (movement: Movement): number => {
  return movement.details.reduce((total, detail) => total + detail.quantity, 0);
};

// Calculate total price sold for a movement
export const calculateTotalPriceSold = (movement: Movement): string => {
  const total = movement.details.reduce(
    (total, detail) => total + parseFloat(detail.priceSold),
    0
  );
  return total.toFixed(2);
};

export const currencyFormatter = (value: number | string): string => {
  // Parse the value to a float if it's a string; keep it as is if it's already a number
  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  // Check if the parsed value is a valid number
  if (isNaN(numberValue)) {
    return "";
  }

  // Format the number as currency with commas as thousand separators
  return `€${numberValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customCurrencyFormatter = (params: any): string => {
  const value = params.value;

/*   console.log("Custom Formatter - Processing value:", value);
 */
  if (value === null || value === undefined || value === "") {
    return "€0.00"; // Handle empty or null values
  }

  // If value is a string, try to parse it to a float
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;

  // If parsing fails (resulting in NaN), return the original value as a string
  if (isNaN(parsedValue)) {
    console.warn("Custom Formatter - Invalid number format for value:", value);
    return value.toString();
  }

  // Format the number as currency
  return `€${parsedValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
};

export const numberComparator = (valueA: number, valueB: number) => {
  return valueA - valueB;
};

export const getTrend = (percentage: string | number) =>
  parseFloat(`${percentage}`) > 50 ? "up" : "down";

export const getAdjustedClients = (
  role: UserRole,
  currentUserData: Client | Admin | Agent | null,
  clients: Record<string, Client>
) => {
  if (role === "employee" || role === "guest") {
    return [];
  }
  if (role === "client" && currentUserData) {
    return [currentUserData as Client]; // Adjusted clients for client role
  } else {
    return Object.values(clients); // Adjusted clients for other roles
  }
};

export const getMovementsByRole = (
  role: UserRole,
  currentUserData: Admin | Client | Agent | null,
  clients: Record<string, Client>
): Movement[] => {
  if (!currentUserData) return [];
  else if (role === "employee" || role === "guest") {
    return [];
  }

  switch (role) {
    case "agent":
      return Object.values(clients).flatMap((client) => client.movements);
    case "client":
      return (currentUserData as Client).movements;
    case "admin":
      return Object.values(clients).flatMap((client) => client.movements);
    default:
      return [];
  }
};

export const filterCurrentMonthMovements = (
  movements: Movement[],
  currentMonth: number,
  currentYear: number
) =>
  movements.filter((movement) => {
    const movementDate = new Date(movement.dateOfOrder);
    return (
      movementDate.getMonth() === currentMonth &&
      movementDate.getFullYear() === currentYear
    );
  });

export const calculateRevenue = (movements: Movement[]) =>
  movements.reduce(
    (movementSum, movement) =>
      movementSum +
      movement.details.reduce(
        (detailSum, detail) => detailSum + (parseFloat(detail.priceSold) || 0),
        0
      ),
    0
  );

export const calculatePercentage = (part: number, total: number): string =>
  total === 0 ? "0.00" : ((part / total) * 100).toFixed(2);

export const getTwoMonthsFromNow = () => {
  return dayjs().add(2, "month").startOf("day").toDate();
};
