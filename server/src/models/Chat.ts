// models/Chat.ts

import { Document, Schema, Types, model } from "mongoose";

// Define the IMessage interface with server and client IDs
export interface IMessage {
  _id: Types.ObjectId; // Server-generated unique identifier
  local_id?: string; // Optional client-generated identifier for matching
  content: string;
  sender: Types.ObjectId; // ID of the sender
  timestamp: Date;
  readBy: Types.ObjectId[]; // Array of user IDs who have read the message
  messageType: "message" | "alert" | "promo" | "visit"; // Categorizes the message type
  attachments?: { url: string; type: "image" }[]; // Array to store image URLs and types
  status: "pending" | "sent" | "failed"; // Status indicating the message state
}

// Define the IChat interface with server and client IDs
export interface IChat extends Document {
  _id: Types.ObjectId; // Server-generated unique identifier
  local_id?: string; // Optional client-generated identifier for matching
  type: "simple" | "group" | "broadcast"; // Type of chat
  name?: string; // Optional, mainly for group chats
  description?: string; // Optional, mainly for groups and broadcasts
  participants: Types.ObjectId[]; // List of participant user IDs
  admins?: Types.ObjectId[]; // Admins, mainly for group and broadcast chats
  messages: IMessage[]; // Array of messages within the chat
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "created" | "failed"; // Status indicating the chat state
}

// Define the schema for Message with client and server IDs
const messageSchema = new Schema<IMessage>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true }, // Auto-generated server-side
    local_id: { type: String }, // Client-side generated ID
    content: {
      type: String,
      required: function () {
        // Content is required only if no attachments are present
        return !(this.attachments && this.attachments.length > 0);
      },
      maxlength: 2000,
      validate: {
        validator: function (v: string) {
          return Buffer.from(v).toString("utf8") === v;
        },
        message: "Message content must be valid UTF-8.",
      },
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messageType: {
      type: String,
      enum: ["message", "alert", "promo", "visit"],
      required: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image"], required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
  },
  { _id: false } // Do not override _id behavior
);

// Define the schema for Chat with client and server IDs
const chatSchema = new Schema<IChat>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true }, // Auto-generated server-side
    local_id: { type: String }, // Client-side generated ID
    type: {
      type: String,
      enum: ["simple", "group", "broadcast"],
      required: true,
    },
    name: { type: String },
    description: { type: String },
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "created", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Create a unique compound index on participants and type for simple chats
chatSchema.index(
  { type: 1, participants: 1 },
  { unique: true, partialFilterExpression: { type: "simple" } }
);

// Additional indexes for optimized querying
chatSchema.index({ "messages.timestamp": 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ "messages._id": 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ chatId: 1 });

export const Chat = model<IChat>("Chat", chatSchema);
