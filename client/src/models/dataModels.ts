//src/models/dataModels.ts

export type ChatType = "simple" | "group" | "broadcast";
export type ChatStatus = "pending" | "created" | "failed";

export type EventType = "absence" | "holiday" | "event" | "visit";
export type EventReason =
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
  | "generic";

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
    visits: Visit[];
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
  attachments?: { url: string; type: "image" }[]; // Array to store image URLs and types
  status: "pending" | "sent" | "failed"; // Status indicating the message state

}

export interface IChat {
  _id?: string;
  local_id?: string; // Changed to camelCase
  type: ChatType;
  name?: string;
  description?: string;
  participants: string[];
  admins?: string[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt?: Date;
  status: ChatStatus;
}

export type CalendarEvent = {
  _id?: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  eventType: EventType;
  eventName: string;
  reason: EventReason;
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
