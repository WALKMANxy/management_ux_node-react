export type SearchParams = {
  query: string;
  filter: string;
  results?: SearchResult[];
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
