// src/models/models.ts

export type UserRole = "admin" | "agent" | "client" | "guest";

export type AuthState = {
  isLoggedIn: boolean;
  userRole: UserRole;
  id: string | null;
};

export type AuthHandlersProps = {
  selectedRole: "admin" | "agent" | "client";
  selectedAgent: string;
  selectedClient: string;
  agents: Agent[];
}


// src/models/models.ts
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
  filter?: string;
  onSelect?: (item: string) => void;
  placeholder?: string;
};

export type DetailProps = {
  detail: { [key: string]: any };
};

export type HistoryProps = {
  history: { [key: string]: any }[];
};

export type SearchResultsProps = {
  onSelect: (item: string) => void;
  selectedIndex: number;
  results: SearchResult[];
};

export type SidebarProps = {
  onToggle: (isOpen: boolean) => void;
};

export type Visit = {
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
  name: string;
  discount: string;
  startDate: string;
  endDate: string;
};

export type Client = {
  id: string;
  name: string;
  province: string;
  phone: string;
  totalOrders: number;
  totalRevenue: string;
  unpaidRevenue: string;
  address: string;
  email: string;
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
}

export type FetchDataPayload = {
  clients: Client[];
  clientIndex: Map<string, Client>;
}

