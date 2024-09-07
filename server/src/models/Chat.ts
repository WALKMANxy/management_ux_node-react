// models/Chat.ts

import { Document, Schema, Types, model } from "mongoose";

export interface IMessage {
  _id: string;
  localId?: string; // Client-side generated ID for matching
  content: string;
  sender: Types.ObjectId; // ID of the sender
  timestamp: Date;
  readBy: Types.ObjectId[]; // Array of user IDs who have read the message
  messageType: "message" | "alert" | "promo" | "visit"; // To categorize the message type
  attachments?: { url: string; type: "image" }[]; // Array to store image URLs and types
  status: "pending" | "sent" | "failed"; // Status indicating the message state
}

export interface IChat extends Document {
  _id: string;
  type: "simple" | "group" | "broadcast"; // Type of chat
  name?: string; // Optional, mainly for group chats
  description?: string; // Optional, mainly for groups and broadcasts
  participants: Types.ObjectId[]; // List of participants, relevant for all chat types
  admins?: Types.ObjectId[]; // Admins, mainly for group and broadcast chats
  messages: IMessage[]; // Array of messages within the chat
  isBroadcast?: boolean; // Optional, specifically for broadcasts
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    localId: { type: String },
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
        url: { type: String, required: true }, // URL of the stored image
        type: { type: String, enum: ["image"], required: true }, // Define type as image
      },
    ],
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    type: {
      type: String,
      enum: ["simple", "group", "broadcast"],
      required: true,
    },
    name: { type: String }, // Used for groups and broadcasts
    description: { type: String }, // Optional, mainly for groups and broadcasts
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }], // Only relevant for group and broadcast types
    messages: [messageSchema], // Array of message documents within the chat
    isBroadcast: { type: Boolean, default: false }, // Specific to broadcast types
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for optimized querying
chatSchema.index({ type: 1, participants: 1 });
chatSchema.index({ isBroadcast: 1 });
chatSchema.index({ "messages.timestamp": 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ "messages._id": 1 });
chatSchema.index({ type: 1 });

export const Chat = model<IChat>("Chat", chatSchema);
