import { Movement } from "./dataModels";

export type UserRole = "admin" | "agent" | "client" | "guest";

export type User = {
  _id: string; // Corresponds to MongoDB's _id
  email: string;
  googleId?: string;
  password?: string; // Optional for OAuth users
  passwordResetToken?: string; // Optional for password reset
  passwordResetExpires?: Date; // Optional for password reset
  role: UserRole;
  entityCode: string; // Code linking to admin, agent, or client
  entityName?: string;
  avatar?: string;

  authType: "email" | "google"; // New field to distinguish authentication type
  isEmailVerified?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  agents: Agent[];
  clients: Client[];
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
  agent: string;
  agentName?: string;
  movements: Movement[];
  colour?: string;
};

export type Agent = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: Client[];
};
