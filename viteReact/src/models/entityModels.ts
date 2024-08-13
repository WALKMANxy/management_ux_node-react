import { Alert, Movement, Promo, Visit } from "./dataModels";

export type UserRole = "admin" | "agent" | "client" | "guest";

export type User = {
  id: string; // Corresponds to MongoDB's _id
  email: string;
  googleId?: string;
  password?: string; // Optional for OAuth users
  passwordResetToken?: string; // Optional for password reset
  passwordResetExpires?: Date; // Optional for password reset
  role: UserRole;
  entityCode: string; // Code linking to admin, agent, or client
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  agents: Agent[];
  clients: Client[];
  GlobalVisits: {
    [agentId: string]: {
      Visits: Visit[];
    };
  };
  GlobalPromos: {
    [agentId: string]: {
      Promos: Promo[];
    };
  };
  adminAlerts: Alert[];
};

export type Client = {
  id: string;
  name: string;
  extendedName?: string; // New property
  province?: string;
  phone?: string;
  totalOrders: number;
  totalRevenue: string;
  unpaidRevenue: string;
  address?: string;
  email?: string;
  pec?: string; // New property
  taxCode?: string; // New property
  extendedTaxCode?: string; // New property
  paymentMethodID?: string; // New property
  paymentMethod?: string; // New property
  visits: Visit[];
  agent: string;
  agentName?: string;
  movements: Movement[];
  promos: Promo[];
  clientAlerts: Alert[];
};

export type Agent = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: Client[];
  agentAlerts: Alert[];
  AgentVisits: Visit[]; // New property
  AgentPromos: Promo[]; // New property
};
