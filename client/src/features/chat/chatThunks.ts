// Async thunk to fetch all chats for the user

import { createAsyncThunk } from "@reduxjs/toolkit";
import { IChat, IMessage } from "../../models/dataModels";
import {
  createChat,
  fetchAllChats,
  fetchMessages,
  fetchMessagesFromMultipleChats,
  fetchOlderMessages,
  sendMessage,
  updateReadStatus,
} from "./api/chats";

interface FetchOlderMessagesParams {
    chatId: string;
    oldestTimestamp: Date;
    limit: number; // Include limit parameter
  }

// Refactored async thunk to fetch all chats for the user
export const fetchAllChatsThunk = createAsyncThunk(
  "chats/fetchAllChatsThunk",
  async (_, { rejectWithValue }) => {
    try {
      const result = await fetchAllChats(); // Direct API call
      return result; // Return the fetched chats
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch chats"
      );
    }
  }
);

// Refactored async thunk to fetch messages for a specific chat
export const fetchMessagesThunk = createAsyncThunk(
  "chats/fetchMessagesThunk",
  async (
    {
      chatId,
      page = 1,
      limit = 100,
    }: { chatId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const messages = await fetchMessages(chatId, page, limit); // Direct API call
      return { chatId, messages }; // Return the chatId and fetched messages
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch messages"
      );
    }
  }
);

// Thunk action to fetch older messages
export const fetchOlderMessagesThunk = createAsyncThunk<
  { chatId: string; messages: IMessage[] },
  FetchOlderMessagesParams,
  { rejectValue: string }
>(
  "chats/fetchOlderMessagesThunk",
  async ({ chatId, oldestTimestamp, limit }, { rejectWithValue }) => {
    try {
      // Debugging: Log the parameters being sent to the API
      console.log("Fetching Older Messages: ", {
        chatId,
        oldestTimestamp: oldestTimestamp.toISOString(),
        limit,
      });

      // Make the API call
      const messages = await fetchOlderMessages(chatId, oldestTimestamp, limit);

      // Debugging: Log the messages received from the API
      console.log("Received Older Messages: ", messages);

      return { chatId, messages };
    } catch (error) {
      console.error("Error fetching older messages:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch older messages"
      );
    }
  }
);


// Refactored async thunk to fetch messages from multiple chats
export const fetchMessagesFromMultipleChatsThunk = createAsyncThunk(
  "chats/fetchMessagesFromMultipleChatsThunk",
  async (chatIds: string[], { rejectWithValue }) => {
    try {
      const result = await fetchMessagesFromMultipleChats(chatIds); // Direct API call
      return result; // Return the fetched messages from multiple chats
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch messages from multiple chats"
      );
    }
  }
);

// Refactored async thunk to create a new chat
export const createChatThunk = createAsyncThunk(
  "chats/createChatThunk",
  async (chatData: Partial<IChat>, { rejectWithValue }) => {
    try {
      const result = await createChat(chatData); // Direct API call
      return result; // Return the created chat
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create chat"
      );
    }
  }
);

// Async thunk to create a new message
// Refactored async thunk to create a new message
export const createMessageThunk = createAsyncThunk(
  "messages/createMessageThunk",
  async (
    { chatId, messageData }: { chatId: string; messageData: Partial<IMessage> },
    { rejectWithValue }
  ) => {
    try {
      const message = await sendMessage(chatId, messageData); // Direct API call
      return { chatId, message }; // Return the chatId and created message
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  }
);

// New async thunk to update read status for multiple messages
// Refactored async thunk to update read status for multiple messages
export const updateReadStatusThunk = createAsyncThunk(
  "chats/updateReadStatusThunk",
  async (
    { chatId, messageIds }: { chatId: string; messageIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateReadStatus(chatId, messageIds); // Direct API call
      return result; // Return the updated chat with read statuses
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update read status"
      );
    }
  }
);
