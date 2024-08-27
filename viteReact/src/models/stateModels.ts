import { Promo, Visit } from "./dataModels";
import { Admin, Agent, Client, UserRole } from "./entityModels";
import { SearchResult } from "./searchModels";

export type AuthState = {
  isLoggedIn: boolean;
  userRole: UserRole;
  id: string | null;
  userId: string | null;
};

export type ClientsState = {
  clients: Client[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export type CalendarState = {
  visits: Visit[];
};

export type PromosState = {
  promos: Promo[];
};

export type SearchState = {
  query: string;
  results: SearchResult[];
  status: "idle" | "loading" | "succeeded" | "failed";

  error: string | null;
};

export interface DataSliceState {
  clients: Record<string, Client>;
  agents: Record<string, Agent>;
  agentDetails: Record<string, Agent>;
  currentUserData: Client | Agent | Admin | null;
  currentUserDetails: {
    id: string;
    role: "client" | "agent" | "admin";
    name: string;
    userId: string, // Add userId here
    // Add any other common fields here
  } | null;
  selectedClientId: string | null;
  selectedAgentId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export type State = {
  hasError: boolean;
};

export type DataState = {
  clients: Client[];
  clientIndex: Map<string, Client>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export type AgentState = {
  agents: Agent[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export type ClientState = {
  clients: Client[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export type FetchDataPayload = {
  clients: Client[];
  clientIndex: Map<string, Client>;
};
