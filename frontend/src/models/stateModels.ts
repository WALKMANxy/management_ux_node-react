import { Promo, Visit } from "./dataModels";
import { Agent, Client, UserRole } from "./entityModels";
import { SearchResult } from "./searchModels";

export type AuthState = {
  isLoggedIn: boolean;
  userRole: UserRole;
  id: string | null;
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
