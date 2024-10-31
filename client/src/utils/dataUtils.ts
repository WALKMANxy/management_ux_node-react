import dayjs from "dayjs";
import { Movement } from "../models/dataModels";
import { Admin, Agent, Client, UserRole } from "../models/entityModels";
import { BrandData } from "../models/propsModels";
import { ignoreArticleNames } from "./constants";

export const now = dayjs();


// Helper function to get month and year from a date string
export const getMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return "Invalid Date";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/[\s./-]/g, "");
};

export const formatDate = (date: Date | string | number) => {
  return dayjs(date).format("DD/MM/YYYY");
};

export const formatDateForecast = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

export const getDotColor = (
  type: string
): "primary" | "success" | "error" | "grey" => {
  switch (type) {
    case "visits":
      return "primary";
    case "sales":
      return "success";
    case "alerts":
      return "error";
    default:
      return "grey";
  }
};

// Calculate total revenue for a list of clients
export const calculateTotalRevenue = (clients: Client[]): number => {
  let total = 0;
  for (let i = 0; i < clients.length; i++) {
    total += parseFloat(clients[i].totalRevenue); // Assuming you store it as a string
  }
  return Number(total.toFixed(2));
};

export const calculateNetRevenue = (clients: Client[]): number => {
  return clients.reduce((netTotal, client) => {
    return (
      netTotal +
      client.movements.reduce((total, movement) => {
        return (
          total +
          movement.details.reduce((detailTotal, detail) => {
            const priceSold = parseFloat(detail.priceSold) || 0;
            const priceBought =
              Math.abs(parseFloat(detail.priceBought) || 0) *
              (detail.quantity || 0);
            return detailTotal + priceSold - priceBought;
          }, 0)
        );
      }, 0)
    );
  }, 0);
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

// Helper function to group movements by order ID
/* const groupByOrderId = (
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
}; */

// Calculate total orders for a list of clients based on unique order IDs
export const calculateTotalOrders = (clients: Client[]): number => {
  const orderIds = new Set<string>();
  for (const client of clients) {
    for (const movement of client.movements) {
      orderIds.add(movement.id);
    }
  }
  return orderIds.size;
};

export const calculateTopBrandsData = (movements: Movement[]): BrandData[] => {
  const brandCount = new Map<string, { name: string; quantity: number }>();

  for (const movement of movements) {
    for (const detail of movement.details) {
      if (detail.brand && !ignoreArticleNames.has(detail.name)) {
        const normalizedBrand = detail.brand.trim().toLowerCase();
        if (!brandCount.has(normalizedBrand)) {
          brandCount.set(normalizedBrand, { name: detail.brand, quantity: 0 });
        }
        brandCount.get(normalizedBrand)!.quantity += detail.quantity;
      }
    }
  }

  const topBrands = Array.from(brandCount.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)
    .map((brand, index) => ({
      id: `${brand.name}-${index}`,
      label: brand.name,
      value: brand.quantity,
    }));

  return topBrands;
};

// Calculate sales distribution data for a list of clients
export const calculateSalesDistributionData = (
  clients: Client[],
  isMobile: boolean
): { label: string; value: number }[] => {
  const topClients = clients
    .map((client) => ({
      label: client.name,
      value: parseFloat(client.totalRevenue),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, isMobile ? 8 : 25);

  return topClients;
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
  const monthlyData: {
    [key: string]: { revenue: number; netRevenue: number; orders: number };
  } = {};

  const orderIdsPerMonth: { [key: string]: Set<string> } = {};

  const revenuePerOrderId: {
    [orderId: string]: { revenue: number; netRevenue: number; monthYear: string };
  } = {};

  for (const client of clients) {
    for (const movement of client.movements) {
      const orderId = movement.id;
      const dateOfOrder = movement.dateOfOrder;
      const monthYear = getMonthYear(dateOfOrder);

      if (monthYear === "Invalid Date") {
        console.error("Skipping movement with invalid date:", movement);
        continue;
      }

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { revenue: 0, netRevenue: 0, orders: 0 };
        orderIdsPerMonth[monthYear] = new Set();
      }

      if (!revenuePerOrderId[orderId]) {
        revenuePerOrderId[orderId] = { revenue: 0, netRevenue: 0, monthYear };
      }

      let movementRevenue = 0;
      let movementNetRevenue = 0;

      for (const detail of movement.details) {
        const priceSold = parseFloat(detail.priceSold) || 0;
        const priceBought =
          Math.abs(parseFloat(detail.priceBought) || 0) * (detail.quantity || 0);
        movementRevenue += priceSold;
        movementNetRevenue += priceSold - priceBought;
      }

      revenuePerOrderId[orderId].revenue += movementRevenue;
      revenuePerOrderId[orderId].netRevenue += movementNetRevenue;

      if (!orderIdsPerMonth[monthYear].has(orderId)) {
        orderIdsPerMonth[monthYear].add(orderId);
        monthlyData[monthYear].orders += 1;
      }
    }
  }

  // Aggregate revenue and net revenue per month
  for (const orderId in revenuePerOrderId) {
    const { revenue, netRevenue, monthYear } = revenuePerOrderId[orderId];
    monthlyData[monthYear].revenue += revenue;
    monthlyData[monthYear].netRevenue += netRevenue;
  }

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

export const calculateTotalNetPriceSold = (movement: Movement): string => {
  // Calculate total price sold
  const totalPriceSold = movement.details.reduce(
    (total, detail) => total + parseFloat(detail.priceSold),
    0
  );

  // Calculate total cost of goods sold (COGS)
  const totalCostOfGoodsSold = movement.details.reduce(
    (total, detail) => total + parseFloat(detail.priceBought) * detail.quantity,
    0
  );

  // Net revenue is total price sold minus COGS
  const netRevenue = totalPriceSold - totalCostOfGoodsSold;

  return netRevenue.toFixed(2);
};

const currencyFormatterInstance = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const currencyFormatter = (value: number | string): string => {
  const numberValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numberValue)) {
    return "";
  }
  return currencyFormatterInstance.format(numberValue);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customCurrencyFormatter = (params: any): string => {
  const value = params.value;
  if (value === null || value === undefined || value === "") {
    return currencyFormatterInstance.format(0);
  }
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(parsedValue)) {
    return value.toString();
  }
  return currencyFormatterInstance.format(parsedValue);
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
): Client[] => {
  if (role === "employee" || role === "guest") return [];
  if (role === "client" && currentUserData) return [currentUserData as Client];
  return Object.values(clients);
};

export const getMovementsByRole = (
  role: UserRole,
  currentUserData: Admin | Client | Agent | null,
  clients: Record<string, Client>
): Movement[] => {
  if (!currentUserData || role === "employee" || role === "guest") return [];

  if (role === "agent" || role === "admin") {
    return clients
      ? Object.values(clients).flatMap((client) => client.movements)
      : [];
  }

  if (role === "client") {
    return (currentUserData as Client).movements || [];
  }

  return [];
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
