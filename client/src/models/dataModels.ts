// models/dataModels.ts

export interface Alert {
  _id: string; // Add the _id field
  alertReason: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
  alertIssuedBy: string;
  entityRole: "admin" | "agent" | "client";
  entityCode: string;
  markedAsRead: boolean;
}


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

export interface GlobalVisits {
  [agentId: string]: {
    Visits: Visit[];
  };
}

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


export interface GlobalPromos {
  [agentId: string]: {
    Promos: Promo[];
  };
}