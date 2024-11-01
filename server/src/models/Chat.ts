//src/models/Chat.ts
import { Document, Schema, Types, model } from "mongoose";

export interface IMessage {
  _id: Types.ObjectId; // Server-generated unique identifier
  local_id?: string; // Optional client-generated identifier for matching
  content: string;
  sender: Types.ObjectId; // ID of the sender
  timestamp: Date;
  readBy: Types.ObjectId[]; // Array of user IDs who have read the message
  messageType: "message" | "alert" | "promo" | "visit"; // Categorizes the message type
  attachments: Attachment[]; // Array to store attachments with metadata
  status: "pending" | "sent" | "failed"; // Status indicating the message state
  isUploading?: boolean; // Tracks if the message is still uploading
}

export interface Attachment {
  url: string;
  type: "image" | "video" | "pdf" | "word" | "spreadsheet" | "other";
  fileName: string;
  size: number;
  chatId?: Types.ObjectId;
  messageId?: string; // Store `local_id` or `_id`
  uploadProgress?: number;
  status: "pending" | "uploading" | "uploaded" | "failed";
}

export interface IChat extends Document {
  _id: Types.ObjectId;
  local_id?: string;
  type: "simple" | "group" | "broadcast";
  name?: string;
  description?: string;
  participants: Types.ObjectId[];
  admins?: Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: "pending" | "created" | "failed";
}

const messageSchema = new Schema<IMessage>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    local_id: { type: String },
    content: {
      type: String,
      required: function () {
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
        type: {
          type: String,
          enum: ["image", "video", "pdf", "word", "spreadsheet", "other"],
          required: true,
        },
        fileName: { type: String, required: true },
        size: { type: Number, required: true },
        chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
        messageId: { type: String },
        uploadProgress: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["pending", "uploading", "uploaded", "failed"],
          default: "pending",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    isUploading: { type: Boolean, default: false },
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    local_id: { type: String },
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

chatSchema.index(
  { type: 1, participants: 1 },
  { unique: true, partialFilterExpression: { type: "simple" } }
);

chatSchema.index(
  { type: 1, name: 1 },
  { unique: true, partialFilterExpression: { type: "group" } }
);

chatSchema.index(
  { type: 1, admins: 1 },
  { unique: true, partialFilterExpression: { type: "broadcast" } }
);

chatSchema.index({ "messages.timestamp": 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ admins: 1 });
chatSchema.index({ "messages._id": 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ chatId: 1 });

export const Chat = model<IChat>("Chat", chatSchema);
