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

// models/Message.ts

export interface IMessage {
  _id: string;
  content: string;
  sender: string; // User ID of the sender
  timestamp: Date;
  readBy: string[]; // Array of user IDs who have read the message
  messageType: "message" | "alert" | "promo" | "visit"; // Categorize the message type
  mediaUrl?: string; // Optional, in case of media attachments like images (future-proofing)
}

// models/Chat.ts

export interface IChat {
  _id: string;
  type: "simple" | "group" | "broadcast"; // Type of chat
  name?: string; // Optional, mainly for group chats
  description?: string; // Optional, mainly for groups and broadcasts
  participants: string[]; // List of participant user IDs
  admins?: string[]; // Admins, mainly for group and broadcast chats
  messages: IMessage[]; // Array of messages within the chat
  isBroadcast?: boolean; // Specific to broadcasts
  createdAt: Date;
  updatedAt: Date;
}
