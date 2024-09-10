// controllers/chatController.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../models/types";
import { ChatService } from "../services/chatService";
import { messageSchema } from "../utils/joiUtils";
import { logger } from "../utils/logger";

export class ChatController {
  // Fetch all chats for the authenticated user with the latest message preview
  static async fetchAllChats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (req.user) {
        const userId = req.user.id; // Assuming user ID is available in the request object after authentication
        const chats = await ChatService.getAllChats(userId);
        res.status(200).json(chats);
      } else {
        res.status(401).json({ message: "User not authenticated" });
      }
    } catch (error) {
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  }

  // Fetch a specific chat by its ID
  static async fetchChatById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { chatId } = req.params;

      // Validate chat ID format
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        res.status(400).json({ message: "Invalid chat ID format." });
        return;
      }

      // Check if the user is authenticated
      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      // Fetch the chat using the service
      const chat = await ChatService.getChatById(chatId, req.user.id);

      if (!chat) {
        res.status(404).json({ message: "Chat not found" });
        return;
      }

      res.status(200).json(chat);
    } catch (error) {
      console.error("Error fetching chat:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Fetch messages for a specific chat with pagination
  static async fetchMessages(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { chatId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Validate chatId format
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        res.status(400).json({ message: "Invalid chat ID format." });
      }

      // Validate pagination parameters
      if (page < 1 || limit < 1) {
        res.status(400).json({ message: "Invalid pagination parameters." });
      }

      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
      } else {
        // Fetch messages using the service, including the participant check
        const messages = await ChatService.getMessages(
          chatId,
          req.user.id,
          page,
          limit
        );

        // Check if messages are returned and respond appropriately
        if (!messages || messages.length === 0) {
          res.status(200).json({ message: "No messages found." });
        }

        // Return the messages if found
        res.status(200).json(messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async fetchMessagesFromMultipleChats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const chatIds = req.query.chatIds as string[]; // Expect chatIds as query parameters

      if (!chatIds || !Array.isArray(chatIds)) {
        res.status(400).json({ message: "chatIds must be an array of IDs." });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      // Fetch messages grouped by chat ID
      const messagesGroupedByChat =
        await ChatService.getMessagesFromMultipleChats(chatIds, req.user.id);

      if (!messagesGroupedByChat || messagesGroupedByChat.length === 0) {
        res.status(200).json({ message: "No messages found." });
      } else {
        res.status(200).json(messagesGroupedByChat);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Create a new chat (simple, group, or broadcast) // Create a new chat (simple, group, or broadcast)
  static async createChat(req: Request, res: Response): Promise<void> {
    try {
      const chatData = req.body;

      if (
        !chatData.type ||
        !["simple", "group", "broadcast"].includes(chatData.type)
      ) {
        res.status(400).json({ message: "Invalid chat type." });
      }

      if (
        chatData.type === "group" &&
        (!chatData.name || !chatData.participants)
      ) {
        res
          .status(400)
          .json({ message: "Group chats must have a name and participants." });
      }

      if (!chatData.local_id) {
        res
          .status(400)
          .json({ message: "local_id is required for chat creation." });
      }

      await ChatService.createChat(chatData);
      res.status(201);
    } catch (error) {
      console.error("Error creating chat:", error);
      res.status(400).json({ message: "Failed to create chat." });
    }
  }

  // Add a message to an existing chat
  static async addMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const messageData = req.body;

      const { error } = messageSchema.validate({ chatId, messageData });
      if (error) {
        logger.warn("Validation error on chat:message", {
          error: error.message,
        });
        res.status(400).json({ message: error.message });
      }

      // Sanitize the message content to prevent XSS attacks
      messageData.content = sanitizeHtml(messageData.content, {
        allowedTags: [],
        allowedAttributes: {},
      });

      const updatedChat = await ChatService.addMessage(chatId, messageData);
      if (!updatedChat) {
        res.status(404).json({ message: "Chat not found." });
      }

      res.status(201);
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(400).json({ message: "Failed to add message." });
    }
  }

  // Update read status for multiple messages in a chat
  static async updateReadStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { chatId } = req.params;
      const { messageIds } = req.body; // Accept message IDs as an array in the request body

      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
      } else {
        const userId = req.user.id;

        // Call the service to update the read status
        const updatedChat = await ChatService.updateReadStatus(
          chatId,
          messageIds,
          userId
        );

        if (!updatedChat) {
          res.status(404).json({ message: "Chat or messages not found." });
        }

        res.status(201);
      }
    } catch (error) {
      console.error("Error updating read status:", error);
      res.status(400).json({ message: "Failed to update read status." });
    }
  }
}

function sanitizeHtml(
  content: any,
  arg1: { allowedTags: never[]; allowedAttributes: {} }
): any {
  throw new Error("Function not implemented.");
}
