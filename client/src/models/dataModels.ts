// src/models/dataModels.ts

export type MovementDetail = {
  articleId: string;
  name: string;
  brand: string;
  quantity: number;
  unitPrice: string;
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
  clientId: string;
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
  clientsId: string[];
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
  _id: string;
  local_id?: string;
  content: string;
  sender: string;
  timestamp: Date;
  readBy: string[];
  messageType: "message" | "alert" | "promo" | "visit";
  attachments: Attachment[];
  status: "pending" | "sent" | "failed";
  isUploading?: boolean;
}

export interface Attachment {
  file?: File;
  url: string;
  type: "image" | "video" | "pdf" | "word" | "spreadsheet" | "other";
  fileName: string;
  size: number;
  chatId?: string;
  messageId?: string;
  uploadProgress: number;
  status: "pending" | "uploading" | "uploaded" | "failed";
}

export interface IChat {
  _id?: string;
  local_id: string;
  type: "simple" | "group" | "broadcast";
  name?: string;
  description?: string;
  participants: string[];
  admins?: string[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt?: Date;
  status: "pending" | "created" | "failed";
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
    | "issues"
    | "routine"
    | "new_client"
    | "generic"
    | "";
  note?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  visitClientId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export interface MonthlyData {
  revenue: number;
  netRevenue: number;
  orders: number;
}
