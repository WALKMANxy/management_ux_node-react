// models/dataModels.ts

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
  discountCategory?: string;
  clientId?: string;
  agentId?: string;
  details: MovementDetail[];
  unpaidAmount: string;
  paymentDueDate: string;
  dateOfOrder: string;
};

export type Visit = {
  _id?: string;
  clientId: string; // Client associated with this visit
  type: string;
  visitReason: string;
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
  _id?: string;
  clientsId: string[]; // Array of client IDs this promo applies to
  global?: boolean;
  excludedClientsId?: string[];
  promoType: string;
  name: string;
  discount: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  promoIssuedBy: string;
};

export interface IMessage {
  _id: string; // Server-generated unique identifier
  local_id?: string; // Client-generated identifier for matching
  content: string;
  sender: string; // User ID of the sender
  timestamp: Date;
  readBy: string[]; // Array of user IDs who have read the message
  messageType: "message" | "alert" | "promo" | "visit"; // Categorizes the message type
  attachments: { url: string; type: "image" }[]; // Array to store image URLs and types
  status: "pending" | "sent" | "failed"; // Status indicating the message state
}

export interface IChat {
  _id?: string; // Server-generated unique identifier
  local_id: string; // Client-generated identifier for matching
  type: "simple" | "group" | "broadcast"; // Type of chat
  name?: string; // Optional, mainly for group chats
  description?: string; // Optional, mainly for groups and broadcasts
  participants: string[]; // List of participant user IDs
  admins?: string[]; // Admins, mainly for group and broadcast chats
  messages: IMessage[]; // Array of messages within the chat
  createdAt: Date;
  updatedAt?: Date;
  status: "pending" | "created" | "failed"; // Status indicating the chat state
}

export type CalendarEvent = {
  _id?: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  eventType: "absence" | "holiday" | "event" | "visit" | "";
  eventName: string;
  reason:
    | "illness"
    | "day_off"
    | "unexpected_event"
    | "medical_visit"
    | "public_holiday"
    | "company_holiday"
    | "company_meeting"
    | "company_party"
    | "conference"
    | "expo"
    | "generic"
    | ""
    ;
  note?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
};

export interface Holiday {
  date: string; // ISO date string (e.g., "2024-01-01")
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}
