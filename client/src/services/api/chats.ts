// src/api/chatApi.ts

import { IChat, IMessage } from "../../models/dataModels";
import { apiCall } from "./apiUtils";


// Fetch all chats for the authenticated user
export const fetchAllChats = async (): Promise<IChat[]> => {
    try {
      return await apiCall<IChat[]>('chats', 'GET');
    } catch (error) {
      console.error("Error fetching all chats:", error);
      throw error;
    }
  };

  // Fetch messages for a specific chat with pagination
  export const fetchMessages = async (
    chatId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<IMessage[]> => {
    try {
      if (!chatId || page < 1 || limit < 1) {
        throw new Error("Invalid parameters for fetching messages.");
      }
      return await apiCall<IMessage[]>(
        `chats/${chatId}/messages?page=${page}&limit=${limit}`,
        'GET'
      );
    } catch (error) {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      throw error;
    }
  };

  // Create a new chat (simple, group, or broadcast)
  export const createChat = async (chatData: Partial<IChat>): Promise<IChat> => {
    try {
      // Perform client-side validation before sending the request
      if (!chatData.type || !["simple", "group", "broadcast"].includes(chatData.type)) {
        throw new Error("Invalid chat type.");
      }
      if (chatData.type === "group" && (!chatData.name || !chatData.participants)) {
        throw new Error("Group chats must have a name and participants.");
      }
      return await apiCall<IChat>('chats', 'POST', chatData);
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  };

  // Send a message to an existing chat
  export const sendMessage = async (
    chatId: string,
    messageData: Partial<IMessage>
  ): Promise<IMessage> => {
    try {
      // Validate chatId and message content
      if (!chatId || !messageData.content || !messageData.sender) {
        throw new Error("Invalid message data.");
      }
      return await apiCall<IMessage>(`chats/${chatId}/messages`, 'POST', messageData);
    } catch (error) {
      console.error(`Error sending message to chat ${chatId}:`, error);
      throw error;
    }
  };

  // Update read status for a message in a chat
  export const updateReadStatus = async (
    chatId: string,
    messageId: string
  ): Promise<IChat> => {
    try {
      // Validate IDs
      if (!chatId || !messageId) {
        throw new Error("Invalid chat or message ID.");
      }
      return await apiCall<IChat>(`chats/${chatId}/messages/${messageId}/read`, 'PATCH');
    } catch (error) {
      console.error(`Error updating read status for message ${messageId} in chat ${chatId}:`, error);
      throw error;
    }
  };