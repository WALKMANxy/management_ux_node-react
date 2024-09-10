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
export const fetchAllChatsThunk = createAsyncThunk(
  "chats/fetchAllChatsThunk",
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
export const fetchMessagesThunk = createAsyncThunk(
  "chats/fetchMessagesThunk",
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

export const fetchMessagesFromMultipleChatsThunk = createAsyncThunk(
  "chats/fetchMessagesFromMultipleChatsThunk",
  async (chatIds: string[], { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        chatApi.endpoints.fetchMessagesFromMultipleChats.initiate(chatIds)
      ).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch messages from multiple chats"
      );
    }
  }
);

// Async thunk to create a new chat
export const createChatThunk = createAsyncThunk(
  "chats/createChatThunk",
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

// Async thunk to create a new message
export const createMessageThunk = createAsyncThunk(
  "messages/createMessageThunk",
  async (
    { chatId, messageData }: { chatId: string; messageData: Partial<IMessage> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const result = await dispatch(
        chatApi.endpoints.sendMessage.initiate({ chatId, messageData })
      ).unwrap();
      return { chatId, message: result };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  }
);

// New async thunk to update read status for multiple messages
export const updateReadStatusThunk = createAsyncThunk(
  "chats/updateReadStatusThunk",
  async (
    { chatId, messageIds }: { chatId: string; messageIds: string[] },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const result = await dispatch(
        chatApi.endpoints.updateReadStatus.initiate({ chatId, messageIds })
      ).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update read status"
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
    setCurrentChatReducer: (state, action: PayloadAction<IChat>) => {
      state.currentChat = action.payload;
    },
    addMessageReducer: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: IMessage;
        fromServer?: boolean; // New flag to distinguish server-originated actions
      }>
    ) => {
      const { chatId, message, fromServer } = action.payload;

      if (fromServer) return; // Skip processing if the action is from the server

      // Ensure the chat exists
      if (!state.chats[chatId]) {
        console.error("Chat does not exist in the state.");
        return;
      }

      // Determine the message ID
      const messageId = message.local_id;

      // If the message already exists, update status and _id
      if (messageId && state.messages[messageId]) {
        const existingMessage = state.messages[messageId];
        existingMessage.status = message.status;
        existingMessage._id = message._id;
        return;
      }

      // Add the new message to the state using local_id if available
      if (messageId) {
        state.messages[messageId] = message;

        // Update the message IDs for the corresponding chat
        if (!state.messageIdsByChat[chatId]) {
          state.messageIdsByChat[chatId] = [];
        }
        state.messageIdsByChat[chatId].push(messageId);
      }
    },

    updateReadStatusReducer: (
      state,
      action: PayloadAction<{
        chatId: string; // Required for other components;
        userId: string;
        messageIds: string[];
        fromServer?: boolean; // New flag to distinguish server-originated actions
      }>
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { chatId, userId, messageIds, fromServer } = action.payload;

      if (fromServer) return; // Skip processing if the action is from the server

      // Optional: Use `chatId` in a way that does not affect the reducer logic
      // console.log(`Updating read status for chat: ${chatId}`); // Uncomment if logging helps

      // Update the read status for the specified message IDs
      messageIds.forEach((messageId) => {
        const message = state.messages[messageId];
        if (message && !message.readBy.includes(userId)) {
          message.readBy.push(userId);
        }
      });
    },

    markMessagesAsReadReducer: (
      state,
      action: PayloadAction<{ chatId: string; currentUserId: string }>
    ) => {
      const { chatId, currentUserId } = action.payload; // Extract currentUserId from the action payload
      const messageIds = state.messageIdsByChat[chatId];

      if (messageIds) {
        messageIds.forEach((messageId) => {
          const message = state.messages[messageId];

          // Check if the message exists, is not sent by the current user, and hasn't been marked as read
          if (
            message &&
            !message.readBy.includes(currentUserId) // Ensure the user hasn't already read the message
          ) {
            message.readBy.push(currentUserId); // Mark the message as read by the current user
          }
        });
      }
    },
    addChatReducer: (state, action: PayloadAction<IChat>) => {
      const chat = action.payload;
      state.chats[chat._id] = chat;
      state.messageIdsByChat[chat._id] = chat.messages.map((msg) => msg._id);
      chat.messages.forEach((msg) => {
        state.messages[msg._id] = msg;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllChatsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllChatsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        action.payload.forEach((chat: WritableDraft<IChat>) => {
          state.chats[chat._id] = chat;
        });
      })
      .addCase(fetchAllChatsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(fetchMessagesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { chatId, messages } = action.payload;

        messages.forEach((message: IMessage) => {
          // Prefer local_id for state consistency
          const messageId = message.local_id;
          if (messageId) {
            state.messages[messageId] = message;
            // Avoid pushing duplicate message IDs
            if (!state.messageIdsByChat[chatId]) {
              state.messageIdsByChat[chatId] = [];
            }
            if (!state.messageIdsByChat[chatId].includes(messageId)) {
              state.messageIdsByChat[chatId].push(messageId);
            }
          } else {
            console.error(`Message missing _id: ${JSON.stringify(message)}`);
          }
        });
      })

      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle fetchMessagesFromMultipleChatsThunk
      .addCase(fetchMessagesFromMultipleChatsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchMessagesFromMultipleChatsThunk.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          action.payload.forEach(({ chatId, messages }) => {
            // Add messages to state ensuring that each chat's messages are up-to-date
            messages.forEach((message) => {
              const messageId = message.local_id || message._id;
              if (messageId) {
                state.messages[messageId] = message;
                if (!state.messageIdsByChat[chatId]) {
                  state.messageIdsByChat[chatId] = [];
                }
                if (!state.messageIdsByChat[chatId].includes(messageId)) {
                  state.messageIdsByChat[chatId].push(messageId);
                }
              }
            });
          });
        }
      )

      .addCase(
        fetchMessagesFromMultipleChatsThunk.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload as string;
        }
      )

      .addCase(createChatThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createChatThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newChat = action.payload;
        state.chats[newChat._id] = newChat;
      })
      .addCase(createChatThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createMessageThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createMessageThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { chatId, message } = action.payload;

        // Ensure the chat exists
        if (!state.chats[chatId]) {
          console.error(`Chat with id ${chatId} does not exist.`);
          return;
        }

        // Use local_id
        const messageId = message.local_id;
        if (messageId) {
          state.messages[messageId] = message;

          // Add the message ID to the corresponding chat
          if (!state.messageIdsByChat[chatId]) {
            state.messageIdsByChat[chatId] = [];
          }
          if (!state.messageIdsByChat[chatId].includes(messageId)) {
            state.messageIdsByChat[chatId].push(messageId);
          }
        } else {
          console.error(`Message missing _id: ${JSON.stringify(message)}`);
        }
      })

      .addCase(createMessageThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const {
  clearChatData,
  setCurrentChatReducer,
  addMessageReducer,
  updateReadStatusReducer,
  markMessagesAsReadReducer,
  addChatReducer,
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
