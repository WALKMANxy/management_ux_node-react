// src/models/models.ts

import { ColDef } from "ag-grid-community";
import { ReactNode } from "react";

export type UserRole = "admin" | "agent" | "client" | "guest";

export type AdminDetails = {
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
};


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




export type AuthHandlersProps = {
  selectedRole: "admin" | "agent" | "client";
  selectedAgent: string;
  selectedClient: string;
  agents: Agent[];
};

export type SearchResult = {
  id: string;
  name: string;
  type: string;
  // Article-specific properties
  articleId?: string;
  brand?: string;
  lastSoldDate?: string;
  // Client-specific properties
  province?: string;
  phone?: string;
  paymentMethod?: string;
  address?: string;
  email?: string;
  agent?: string;
  // Promo-specific properties
  discountAmount?: string;
  isEligible?: boolean;
  startDate?: string;
  endDate?: string;
  // Alert-specific properties
  dateIssued?: string;
  reason?: string;
  severity?: string;
};

export type SearchParams = {
  query: string;
  filter: string;
  results?: SearchResult[];
};

export type SearchState = {
  query: string;
  results: SearchResult[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export type GlobalSearchProps = {
  filter: string;
  onSelect: (item: SearchResult) => void; // Change the callback to accept SearchResult
  placeholder?: string;
};
export type DetailProps = {
  detail: { [key: string]: any };
  isLoading: boolean;
};

export type HistoryProps = {
  history: { [key: string]: any }[];
};

export type SearchResultsProps = {
  onSelect: (item: SearchResult) => void; // Change this to accept SearchResult
  selectedIndex: number;
  results: SearchResult[];
};

export type SidebarProps = {
  onToggle: (isOpen: boolean) => void;
};

export type SalesDistributionProps = {
  salesDistributionDataClients: { label: string; value: number }[];
  salesDistributionDataAgents?: { label: string; value: number }[];
};

export type ActivePromotionsProps = {
  isLoading: boolean;
};

export type Comparison = {
  value: number;
  trend: "up" | "down";
};

export type SpentThisMonthProps = {
  amount: string;
  comparison?: Comparison;
};

export type SpentThisYearProps = {
  amount: string;
  comparison?: Comparison;
};

export type Props = {
  children: ReactNode;
};

export type State = {
  hasError: boolean;
};

export type ClientListProps = {
  quickFilterText: string;
  setQuickFilterText: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  filteredClients: () => any[];
  columnDefs: any[];
  gridRef: any;
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuClose: () => void;
  anchorEl: HTMLElement | null;
  exportDataAsCsv: () => void;
  isClientListCollapsed: boolean;
  setClientListCollapsed: (value: boolean) => void;
  isMobile: boolean;
  clientDetailsRef: React.RefObject<HTMLDivElement>; // Added clientDetailsRef
};


export type TopArticleTypeProps = {
  articles: { id: string; name: string; amount: number }[];
};

export type TotalEarningProps = {
  totalEarning: number;
  isLoading: boolean;
};

export type UpcomingVisitsProps = {
  isLoading: boolean;
};

export type AGGridTableProps = {
  columnDefs: ColDef[];
  rowData: any[];
  paginationPageSize: number;
  quickFilterText: string; // Added quickFilterText prop
};

export type MovementsHistoryProps = {
  movements: Movement[];
};

export type ClientDetailsProps = {
  selectedClient: Client | null;
  isClientDetailsCollapsed: boolean;
  setClientDetailsCollapsed: (value: boolean) => void;
  isLoading: boolean;
  ref: React.Ref<HTMLDivElement>; // Add ref prop
};

export type Visit = {
  id: string;
  clientId: string;
  agentId: string;
  date: string;
  note: string;
};


export type MovementDetail = {
  articleId: string;
  name: string;
  brand: string;
  priceSold: string;
  priceBought: string;
};

export type Movement = {
  id: string;
  discountCategory: string;
  details: MovementDetail[];
  unpaidAmount: string;
  paymentDueDate: string;
  dateOfOrder: string;
};

export type Promo = {
  id: string;
  clientsId: string[]; // Array of client IDs this promo applies to
  agentsId: string[];  // Array of agent IDs this promo applies to
  name: string;
  discount: string;
  startDate: string;
  endDate: string;
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
  movements: Movement[];
  promos: Promo[];
};

export type Agent = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients: Client[];
  alerts?: Alert[];
  AgentVisits: Visit[]; // New property
  AgentPromos: Promo[]; // New property
};

export type Alert = {
  id: string;
  message: string;
  date: string;
  severity: "low" | "medium" | "high";
};

export type DataState = {
  clients: Client[];
  clientIndex: Map<string, Client>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export type FetchDataPayload = {
  clients: Client[];
  clientIndex: Map<string, Client>;
};
