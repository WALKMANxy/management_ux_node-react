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
        .lean(); // Use lean for faster reads as we're not modifying the data

      return chats;
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw new Error("Failed to fetch chats");
    }
  }

  // Fetch a specific chat by its ID for the authenticated user
  static async getChatById(
    chatId: string,
    userId: string
  ): Promise<IChat | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error("Invalid chat ID format.");
      }

      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId, // Ensure the user is a participant
      }).lean();

      return chat;
    } catch (error) {
      console.error("Error fetching chat by ID:", error);
      throw new Error("Failed to fetch chat by ID");
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

  // Fetch messages across multiple chats for the authenticated user
  static async getMessagesFromMultipleChats(
    chatIds: string[],
    userId: string
  ): Promise<{ chatId: string; messages: IMessage[] }[]> {
    try {
      // Validate chat IDs
      if (!chatIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Invalid chat ID format.");
      }

      // Fetch chats including participants and messages, only if user is a participant
      const chats = await Chat.find({
        _id: { $in: chatIds },
        participants: userId,
      })
        .select({ messages: 1, participants: 1 }) // Select only necessary fields
        .lean();

      // Validate and convert userId to ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format.");
      }
      const userObjectId = new Types.ObjectId(userId);

      // Prepare the result as an array of objects, each containing chatId and associated messages
      const result = chats.map((chat) => ({
        chatId: chat._id.toString(),
        messages: chat.participants.some((participant) =>
          participant.equals(userObjectId)
        )
          ? chat.messages
          : [],
      }));

      return result;
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

      // Validation for group chats: must have a name and participants
      if (
        chatData.type === "group" &&
        (!chatData.name ||
          !chatData.participants ||
          chatData.participants.length === 0)
      ) {
        throw new Error(
          "Group chats must have a name and at least one participant."
        );
      }

      // Validation for broadcast chats: must have participants
      if (
        chatData.type === "broadcast" &&
        (!chatData.participants || chatData.participants.length === 0)
      ) {
        throw new Error("Broadcast chats must have participants.");
      }

      // Ensure local_id is provided, especially when originating from the client
      if (!chatData.local_id) {
        throw new Error("local_id is required for chat creation.");
      }

      // Check for an existing simple chat with the same participants
      if (chatData.type === "simple" && chatData.participants) {
        // Sort participant IDs to ensure the uniqueness check is order-agnostic
        const sortedParticipants = chatData.participants
          .map((participant) => participant.toString())
          .sort();

        // Attempt to find an existing chat with the same participants
        const existingChat = await Chat.findOne({
          type: "simple",
          participants: {
            $all: sortedParticipants,
            $size: sortedParticipants.length,
          },
        });

        if (existingChat) {
          // If a chat already exists, return it instead of creating a new one
          return existingChat;
        }
      }

      // Create the new chat instance
      const chat = new Chat({
        ...chatData,
        _id: new mongoose.Types.ObjectId(), // Ensure _id is a valid ObjectId generated by the server
        messages: chatData.messages || [], // Initialize messages as an empty array if not provided
        updatedAt: chatData.updatedAt || new Date(),
        status: "created",
      });
      // Save the chat to the database
      await chat.save();

      // Return the newly created chat object
      return chat;
    } catch (error: any) {
      // Check for duplicate key error (E11000) thrown by MongoDB unique constraint
      if (error.code === 11000) {
        console.error("Duplicate chat creation attempt detected:", error);

        // Attempt to find and return the existing chat if a duplicate error is thrown
        if (chatData.type === "simple" && chatData.participants) {
          const sortedParticipants = chatData.participants
            .map((participant) => participant.toString())
            .sort();

          const existingChat = await Chat.findOne({
            type: "simple",
            participants: {
              $all: sortedParticipants,
              $size: sortedParticipants.length,
            },
          });

          if (existingChat) {
            return existingChat;
          }
        }
      }

      // Log and rethrow the error if it is not a duplicate error
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

      // Create a new message object with both server and client IDs
      const newMessage = {
        ...messageData,
        status: "sent",
      };

      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { messages: newMessage }, $set: { updatedAt: new Date() } },
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

  // Update read status for multiple messages in a chat
  static async updateReadStatus(
    chatId: string,
    messageIds: string[],
    userId: string
  ): Promise<IChat | null> {
    try {
      const chat = await Chat.findOne({ _id: chatId });

      if (!chat) {
        throw new Error("Chat not found");
      }

      // Convert userId to ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Iterate over each message ID and update its read status
      messageIds.forEach((messageId) => {
        const message = chat.messages.find(
          (msg) =>
            msg._id.toString() ===
            new mongoose.Types.ObjectId(messageId).toString()
        );
        if (message && !message.readBy.some((id) => id.equals(userObjectId))) {
          message.readBy.push(userObjectId); // Add user to the readBy array if not already present
        }
      });

      await chat.save(); // Save the updated chat document

      return chat.toObject();
    } catch (error) {
      console.error("Error updating read status:", error);
      throw new Error("Failed to update read status");
    }
  }
}
