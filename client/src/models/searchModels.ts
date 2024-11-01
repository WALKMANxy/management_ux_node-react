//src/models/searchModels.ts
export type SearchResult = {
  id: string;
  name: string;
  type: "client" | "agent" | "article" | "promo" | "visit";
  notAvailable?: "Not Available";
  // Client/Agent-specific properties
  extendedName?: string;
  province?: string;
  phone?: string;
  totalOrders?: number;
  totalRevenue?: string;
  unpaidRevenue?: string;
  address?: string;
  email?: string;
  pec?: string;
  taxCode?: string;
  extendedTaxCode?: string;
  paymentMethodID?: string;
  paymentMethod?: string;
  agent?: string;
  agentName?: string;
  colour?: string;
  // Article-specific properties
  brand?: string;
  quantity?: number;
  unitPrice?: string;
  priceSold?: string;
  priceBought?: string;
  lastSoldDate?: string;
  // Promo-specific properties
  promoType?: string;
  discount?: string;
  startDate?: Date;
  endDate?: Date;
  agentId?: string;
  clientsId?: string[];
  promoIssuedBy?: string;
  // Visit-specific properties
  clientId?: string;
  visitType?: string;
  reason?: string;
  date?: Date;
  notePublic?: string;
  notePrivate?: string;
  pending?: boolean;
  completed?: boolean;
  visitIssuedBy?: string;
};

export type SearchParams = {
  query: string;
  filter: string;
  exact?: boolean;
  results?: SearchResult[];
};
