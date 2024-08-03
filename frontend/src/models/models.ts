// src/models/models.ts

import { ColDef } from "ag-grid-community";
import { ReactNode } from "react";

export type UserRole = "admin" | "agent" | "client" | "guest";

export type User = {
  id: string; // Corresponds to MongoDB's _id
  email: string;
  googleId?: string;
  password?: string; // Optional for OAuth users
  passwordResetToken?: string; // Optional for password reset
  passwordResetExpires?: Date; // Optional for password reset
  role: UserRole;
  entityCode?: string; // Code linking to admin, agent, or client
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
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
  startDate?: Date; // Keep as Date
  endDate?: Date; // Keep as Date
  promoIssuedBy?: string;
  // Visit-specific properties
  reason?: string;
  date?: Date;
  pending?: boolean;
  completed?: boolean;
  visitIssuedBy?: string;
  // Alert-specific properties
  createdAt?: string;
  alertReason?: string;
  severity?: string;
  alertIssuedBy?: string;
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
  onSelect?: (item: SearchResult) => void; // Change the callback to accept SearchResult
  placeholder?: string;
  isHeaderSearch?: boolean;
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

export type ArticleColumnDefinition = {
  headerName: string;
  field?: string;
  filter: string;
  sortable: boolean;
  cellRenderer?: (params: any) => JSX.Element;
  valueFormatter?: (params: any) => string;
  valueGetter?: (params: any) => number;
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
  isAgentSelected?: boolean;
};

export type SpentThisYearProps = {
  amount: string;
  comparison?: Comparison;
  isAgentSelected?: boolean;
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

export type MovementListProps = {
  quickFilterText: string;
  setQuickFilterText: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  filteredMovements: () => any[];
  columnDefs: any[];
  gridRef: any;
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuClose: () => void;
  anchorEl: HTMLElement | null;
  exportDataAsCsv: () => void;
  isMovementListCollapsed: boolean;
  setMovementListCollapsed: (value: boolean) => void;
  isMobile: boolean;
  movementDetailsRef: React.RefObject<HTMLDivElement>;
};

export type MovementDetailsProps = {
  selectedMovement: Movement | null;
  isMovementDetailsCollapsed: boolean;
  setMovementDetailsCollapsed: (value: boolean) => void;
  isLoading: boolean;
  ref: React.Ref<HTMLDivElement>;
};

export type TopArticleTypeProps = {
  articles: { id: string; name: string; quantity: number }[];
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
  clientId: string; // Unique association with a client
  type: string;
  reason: string;
  createdAt: Date;
  date: Date;
  notePublic?: string;
  notePrivate?: string;
  pending: boolean;
  completed: boolean;
  visitIssuedBy: string;
};

export type ArticlesListProps = {
  quickFilterText: string;
  setQuickFilterText: (value: string) => void;
  filteredArticles: () => MovementDetail[];
  columnDefs: any[];
  gridRef: any;
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleMenuClose: () => void;
  anchorEl: HTMLElement | null;
  exportDataAsCsv: () => void;
  isArticleListCollapsed: boolean;
  setArticleListCollapsed: (value: boolean) => void;
  isMobile: boolean;
  articleDetailsRef: React.RefObject<HTMLDivElement>;
};

export type ArticleDetailsProps = {
  selectedArticle: MovementDetail | null;
  isArticleDetailsCollapsed: boolean;
  setArticleDetailsCollapsed: (value: boolean) => void;
  clientMovements?: Movement[]; // Optional prop for client movements
  isLoading: boolean;
};

export type MovementDetailsHistoryProps = {
  movementDetails: MovementDetail[];
};

export type MovementDetail = {
  articleId: string;
  name: string;
  brand: string;
  quantity: number; // Added quantity
  unitPrice: string; // Added unit price
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
  promoType: string;
  name: string;
  discount: string;
  createdAt: Date;
  startDate: Date;
  endDate: string;
  promoIssuedBy: string;
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

export type Alert = {
  id: string;
  alertReason: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
  alertIssuedBy: string;
  targetType: "admin" | "agent" | "client"; // New field
  targetId: string; // New field
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
