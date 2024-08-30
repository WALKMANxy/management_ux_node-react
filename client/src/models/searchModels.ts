export type SearchResult = {
  id: string;
  name: string;
  type: "client" | "agent" | "article" | "promo" | "visit" | "alert";

  notAvailable?: "Not Available";

  // Client-specific properties
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

  // Agent-specific properties
  // (already covered by common fields)

  // Article-specific properties
  articleId?: string;
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

  // Alert-specific properties
  alertReason?: string;
  message?: string;
  severity?: "low" | "medium" | "high";
  createdAt?: string;
  alertIssuedBy?: string;
  entityRole?: "admin" | "agent" | "client";
  entityCode?: string;
  markedAsRead?: boolean;
};

export type SearchParams = {
  query: string;
  filter: string;
  results?: SearchResult[];
};