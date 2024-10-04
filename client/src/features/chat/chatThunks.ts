/* eslint-disable @typescript-eslint/no-explicit-any */
// Async thunk to fetch all chats for the user

import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { IChat, IMessage } from "../../models/dataModels";
import { showToast } from "../../services/toastMessage";
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

interface chatThunkError extends Error {
  statusCode?: number;
  message: string;
}

// Helper function to create authenticated thunks
const createAuthenticatedThunk = <Returned, ThunkArg>(
  type: string,
  payloadCreator: (arg: ThunkArg, thunkAPI: any) => Promise<Returned>
) => {
  return createAsyncThunk<Returned, ThunkArg, { rejectValue: string }>(
    type,
    payloadCreator,
    {
      condition: (_, { getState }) => {
        const state = getState() as RootState;
        if (!state.auth.isLoggedIn) {
          return false; // Prevent the thunk from executing
        }
        return true; // Allow the thunk to execute
      },
    }
  );
};

// Refactored async thunk to fetch all chats for the user
export const fetchAllChatsThunk = createAuthenticatedThunk<IChat[], void>(
  "chats/fetchAllChatsThunk",
  async (_, { rejectWithValue }) => {
    try {
      const result = await fetchAllChats(); // Direct API call
      return result; // Return the fetched chats
    } catch (error) {
      const typedError = error as chatThunkError;
      showToast.error(`Failed to fetch chats: ${typedError.message}`);
      return rejectWithValue(typedError.message || "Failed to fetch chats");
    }
  }
);

// Refactored async thunk to fetch messages for a specific chat
export const fetchMessagesThunk = createAsyncThunk<
  { chatId: string; messages: IMessage[] },
  { chatId: string; page?: number; limit?: number },
  { rejectValue: string }
>(
  "chats/fetchMessagesThunk",
  async ({ chatId, page = 1, limit = 25 }, { rejectWithValue }) => {
    try {
      const messages = await fetchMessages(chatId, page, limit);
      return { chatId, messages };
    } catch (error) {
      const typedError = error as chatThunkError;
      showToast.error(`Failed to fetch messages: ${typedError.message}`);
      return rejectWithValue(typedError.message || "Failed to fetch messages");
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
      const messages = await fetchOlderMessages(chatId, oldestTimestamp, limit);
      return { chatId, messages };
    } catch (error) {
      const typedError = error as chatThunkError;
      showToast.error(`Error fetching older messages: ${typedError.message}`);
      return rejectWithValue(
        typedError.message || "Failed to fetch older messages"
      );
    }
  }
);

// Refactored async thunk to fetch messages from multiple chats
export const fetchMessagesFromMultipleChatsThunk = createAsyncThunk<
  { chatId: string; messages: IMessage[] }[],
  string[],
  { rejectValue: string }
>(
  "chats/fetchMessagesFromMultipleChatsThunk",
  async (chatIds, { rejectWithValue }) => {
    try {
      const result = await fetchMessagesFromMultipleChats(chatIds);
      return result;
    } catch (error) {
      const typedError = error as chatThunkError;
      showToast.error(`Error fetching messages: ${typedError.message}`);
      return rejectWithValue(
        typedError.message || "Failed to fetch messages from multiple chats"
      );
    }
  }
);

// Refactored async thunk to create a new chat
export const createChatThunk = createAsyncThunk<
  IChat,
  Partial<IChat>,
  { rejectValue: string }
>("chats/createChatThunk", async (chatData, { rejectWithValue }) => {
  try {
    const result = await createChat(chatData);
    showToast.success("Chat created successfully!");
    return result;
  } catch (error) {
    const typedError = error as chatThunkError;
    showToast.error(`Failed to create chat: ${typedError.message}`);
    return rejectWithValue(typedError.message || "Failed to create chat");
  }
});

// Refactored async thunk to create a new message
export const createMessageThunk = createAsyncThunk<
  { chatId: string; message: IMessage },
  { chatId: string; messageData: Partial<IMessage> },
  { rejectValue: string }
>(
  "messages/createMessageThunk",
  async ({ chatId, messageData }, { rejectWithValue }) => {
    try {
      const message = await sendMessage(chatId, messageData);
      return { chatId, message };
    } catch (error) {
      const typedError = error as chatThunkError;
      showToast.error(`Failed to create message: ${typedError.message}`);
      return rejectWithValue(typedError.message || "Failed to send message");
    }
  }
);

// Refactored async thunk to update read status for multiple messages
export const updateReadStatusThunk = createAsyncThunk<
  IChat,
  { chatId: string; messageIds: string[] },
  { rejectValue: string }
>(
  "chats/updateReadStatusThunk",
  async ({ chatId, messageIds }, { rejectWithValue }) => {
    try {
      const result = await updateReadStatus(chatId, messageIds);
      return result;
    } catch (error) {
      const typedError = error as chatThunkError;
      showToast.error(
        `Failed to update message read status: ${typedError.message}`
      );
      return rejectWithValue(
        typedError.message || "Failed to update read status"
      );
    }
  }
);
