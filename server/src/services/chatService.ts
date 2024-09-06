// services/chatService.ts

import mongoose, { Types } from "mongoose";
import { Chat, IChat, IMessage } from "../models/Chat";

export class ChatService {
  // Fetch all chats for a user with the latest message preview
  static async getAllChats(userId: string): Promise<IChat[]> {
    try {
      const chats = await Chat.find({
        participants: userId,
      })
        .sort({ updatedAt: -1 }) // Sort by the most recently updated chats
        .select({ messages: { $slice: -1 } }) // Only fetch the latest message for preview
        .populate("participants", "entityName avatar") // Populate participant details for preview
        .lean(); // Use lean for faster reads as we're not modifying the data

      return chats;
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw new Error("Failed to fetch chats");
    }
  }

  // Fetch messages for a specific chat with pagination
  static async getMessages(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IMessage[]> {
    try {
      // Validate chatId and pagination parameters
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error("Invalid chat ID format.");
      }
      if (page < 1 || limit < 1) {
        throw new Error("Invalid pagination parameters.");
      }

      const skip = (page - 1) * limit;

      // Fetch the chat including participants and messages
      const chat = await Chat.findById(chatId, {
        participants: 1,
        messages: { $slice: [skip, limit] },
      }).lean();

      if (!chat) {
        throw new Error("Chat not found");
      }

     // Validate and convert userId to ObjectId
     if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format.");
      }
      const userObjectId = new Types.ObjectId(userId);

      // Check if the user is a participant in the chat
      if (
        !chat.participants.some((participant) =>
          participant.equals(userObjectId)
        )
      ) {
        throw new Error(
          "Access forbidden: You are not a participant in this chat."
        );
      }

      return chat.messages;
    } catch (error) {
      // Type guard to safely access error properties
      if (error instanceof Error) {
        console.error("Error fetching messages:", error.message);
        throw new Error(error.message || "Failed to fetch messages");
      } else {
        console.error("Unexpected error fetching messages:", error);
        throw new Error("Failed to fetch messages");
      }
    }
  }

  // Create a new chat (simple, group, or broadcast)
  static async createChat(chatData: Partial<IChat>): Promise<IChat> {
    try {
      // Validate chat type and required fields
      if (!chatData.type) {
        throw new Error("Chat type is required.");
      }
      if (
        chatData.type === "group" &&
        (!chatData.name || !chatData.participants)
      ) {
        throw new Error("Group chats must have a name and participants.");
      }
      if (chatData.type === "broadcast" && !chatData.isBroadcast) {
        throw new Error("Broadcast chats must be marked as broadcasts.");
      }

      const chat = new Chat(chatData);
      await chat.save();
      return chat;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw new Error("Failed to create chat");
    }
  }

  // Add a message to an existing chat
  static async addMessage(
    chatId: string,
    messageData: Partial<IMessage>
  ): Promise<IChat | null> {
    try {
      // Ensure message data is valid
      if (
        !messageData.sender ||
        !messageData.content ||
        !messageData.messageType
      ) {
        throw new Error("Invalid message data.");
      }

      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { messages: messageData }, $set: { updatedAt: new Date() } },
        { new: true, runValidators: true }
      ).lean();

      if (!chat) {
        throw new Error("Chat not found");
      }

      return chat;
    } catch (error) {
      console.error("Error adding message:", error);
      throw new Error("Failed to add message");
    }
  }

  // Update read status for a message in a chat
  static async updateReadStatus(
    chatId: string,
    messageId: string,
    userId: string
  ): Promise<IChat | null> {
    try {
      const chat = await Chat.findOneAndUpdate(
        { _id: chatId, "messages._id": messageId },
        { $addToSet: { "messages.$.readBy": userId } }, // Add user to the readBy array if not already present
        { new: true }
      ).lean();

      if (!chat) {
        throw new Error("Chat or message not found");
      }

      return chat;
    } catch (error) {
      console.error("Error updating read status:", error);
      throw new Error("Failed to update read status");
    }
  }
}
