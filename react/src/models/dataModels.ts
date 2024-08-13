export type Alert = {
  id: string;
  alertReason: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
  alertIssuedBy: string;
  entityRole: "admin" | "agent" | "client"; // New field
  entityCode: string; // New field
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
