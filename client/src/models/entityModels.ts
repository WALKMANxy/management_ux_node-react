import { MonthlyData, Movement } from "./dataModels";

export type UserRole = "admin" | "agent" | "client" | "employee" | "guest";

export type User = {
  _id: string;
  email: string;
  googleId?: string;
  password?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: UserRole;
  entityCode: string;
  entityName?: string;
  avatar?: string;
  authType: "email" | "google";
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

export interface Employee {
  id: string;
  name: string;
  email: string;
}

export type Client = {
  id: string;
  name: string;
  extendedName?: string;
  province?: string;
  phone?: string;
  totalOrders: number;
  totalRevenue: string;
  totalNetRevenue: string;
  unpaidRevenue: string;
  address?: string;
  email?: string;
  pec?: string;
  taxCode?: string;
  extendedTaxCode?: string;
  paymentMethodID?: string;
  paymentMethod?: string;
  agent: string;
  agentName?: string;
  movements: Movement[];
  monthlyData: { [monthYear: string]: MonthlyData };
  colour?: string;
  agentData?: Agent[];
};

export type Agent = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: Client[];
};
