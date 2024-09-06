// src/store/slices/chatSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import { RootState } from "../../app/store";
import { IChat, IMessage } from "../../models/dataModels";
import { chatApi } from "./chatQueries";

// Define the initial state
interface ChatState {
  chats: Record<string, IChat>;
  messages: Record<string, IMessage>; // Flat structure
  messageIdsByChat: Record<string, string[]>; // Mapping chatId to message IDs
  currentChat: IChat | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ChatState = {
  chats: {},
  messages: {},
  messageIdsByChat: {},
  currentChat: null,
  status: "idle",
  error: null,
};

// Async thunk to fetch all chats for the user
export const fetchAllChats = createAsyncThunk(
  "chats/fetchAllChats",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        chatApi.endpoints.fetchAllChats.initiate()
      ).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch chats"
      );
    }
  }
);

// Async thunk to fetch messages for a specific chat
export const fetchMessages = createAsyncThunk(
  "chats/fetchMessages",
  async (
    {
      chatId,
      page = 1,
      limit = 20,
    }: { chatId: string; page?: number; limit?: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const result = await dispatch(
        chatApi.endpoints.fetchMessages.initiate({ chatId, page, limit })
      ).unwrap();
      return { chatId, messages: result };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch messages"
      );
    }
  }
);

// Async thunk to create a new chat
export const createChat = createAsyncThunk(
  "chats/createChat",
  async (chatData: Partial<IChat>, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        chatApi.endpoints.createChat.initiate(chatData)
      ).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create chat"
      );
    }
  }
);

// Async thunk to send a message to a chat
export const sendMessage = createAsyncThunk(
  "chats/sendMessage",
  async (
    { chatId, messageData }: { chatId: string; messageData: Partial<IMessage> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Optimistically add the message with a temporary ID to handle validation
      const temporaryMessage = {
        ...messageData,
        _id: `temp-${Date.now()}`,
        status: "pending", // Mark as pending for optimistic updates
        timestamp: new Date(),
      } as IMessage;

      // Dispatch addMessage to update the state optimistically
      dispatch(addMessage({ chatId, message: temporaryMessage }));

      // Push the message to the server
      const result = await dispatch(
        chatApi.endpoints.sendMessage.initiate({ chatId, messageData })
      ).unwrap();

      // If successful, return the server response
      return { chatId, message: result };
    } catch (error) {
      // On failure, reject the promise with an error
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  }
);

// Define the chat slice
const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    clearChatData: (state) => {
      state.chats = {};
      state.messages = {};
      state.messageIdsByChat = {};
      state.currentChat = null;
      state.status = "idle";
      state.error = null;
    },
    setCurrentChat: (state, action: PayloadAction<IChat>) => {
      state.currentChat = action.payload;
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: IMessage }>
    ) => {
      const { chatId, message } = action.payload;
      state.messages[message._id] = message; // Add the message to the flat structure
      if (state.messageIdsByChat[chatId]) {
        state.messageIdsByChat[chatId].push(message._id);
      } else {
        state.messageIdsByChat[chatId] = [message._id];
      }
    },
    updateReadStatus: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        userId: string;
      }>
    ) => {
      const { messageId, userId } = action.payload;
      const message = state.messages[messageId];
      if (message && !message.readBy.includes(userId)) {
        message.readBy.push(userId);
      }
    },
    markMessagesAsRead: (
      state,
      action: PayloadAction<{ chatId: string; userId: string }>
    ) => {
      const { chatId, userId } = action.payload;
      const messageIds = state.messageIdsByChat[chatId];
      if (messageIds) {
        messageIds.forEach((messageId) => {
          const message = state.messages[messageId];
          if (message && !message.readBy.includes(userId)) {
            message.readBy.push(userId);
          }
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllChats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllChats.fulfilled, (state, action) => {
        state.status = "succeeded";
        action.payload.forEach((chat: WritableDraft<IChat>) => {
          state.chats[chat._id] = chat;
        });
      })
      .addCase(fetchAllChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { chatId, messages } = action.payload;
        state.messageIdsByChat[chatId] = messages.map((message: IMessage) => {
          state.messages[message._id] = message;
          return message._id;
        });
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(createChat.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newChat = action.payload;
        state.chats[newChat._id] = newChat;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(sendMessage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { chatId, message } = action.payload;
        // Validate and replace the temporary message with the server-confirmed message
        state.messages[message._id] = message;
        if (state.messageIdsByChat[chatId]) {
          state.messageIdsByChat[chatId].push(message._id);
        } else {
          state.messageIdsByChat[chatId] = [message._id];
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        // Optionally, handle the rejection of the message here
        console.error("Failed to send message:", action.payload);
      });
  },
});

export const {
  clearChatData,
  setCurrentChat,
  addMessage,
  updateReadStatus,
  markMessagesAsRead,
} = chatSlice.actions;

export default chatSlice.reducer;

// Selectors
export const selectChatById = (state: RootState, chatId: string) =>
  state.chats.chats[chatId];
export const selectMessagesByChatId = (state: RootState, chatId: string) =>
  state.chats.messageIdsByChat[chatId]?.map(
    (messageId: string) => state.chats.messages[messageId]
  ) || [];
export const selectChatsStatus = (state: RootState) => state.chats.status;
export const selectChatsError = (state: RootState) => state.chats.error;
export const selectCurrentChat = (state: RootState) => state.chats.currentChat;
