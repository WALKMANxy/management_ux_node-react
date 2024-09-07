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
      action: PayloadAction<{ chatId: string; message: IMessage }>
    ) => {
      const { chatId, message } = action.payload;

      // Check if there's a matching local message using localId
      const tempMessageId = Object.keys(state.messages).find(
        (id) => state.messages[id].localId === message.localId
      );

      if (tempMessageId) {
        // If a corresponding local message is found, update its fields
        const existingMessage = state.messages[tempMessageId];

        // Update the message properties without replacing the entire object
        existingMessage._id = message._id;
        existingMessage.status = message.status; // Update status to "sent" or appropriate value
        existingMessage.readBy = message.readBy;

        // No need to update messageIdsByChat as the message remains in the same position
      } else {
        // Check if _id exists before proceeding
        if (!message._id) {
          // Handle the case where _id is missing
          throw new Error(
            "Message _id is missing. Cannot add message to the state."
          );
          // Alternatively, you could log the error or handle it gracefully depending on your needs
        }

        // If _id is present, proceed to add the message to the state
        state.messages[message._id] = message;

        // Add the confirmed message to the messageIdsByChat in the correct order
        if (state.messageIdsByChat[chatId]) {
          state.messageIdsByChat[chatId].push(message._id);
        } else {
          state.messageIdsByChat[chatId] = [message._id];
        }
      }
    },
    sendMessageReducer: (
      state,
      action: PayloadAction<{ chatId: string; messageData: IMessage }>
    ) => {
      const { chatId, messageData } = action.payload;

      if (!messageData.localId) {
        // Handle the case where _id is missing
        throw new Error(
          "Message _id is missing. Cannot add message to the state."
        );
      }

      state.messages[messageData.localId] = messageData; // Use localId as the key
      if (state.messageIdsByChat[chatId]) {
        state.messageIdsByChat[chatId].push(messageData.localId);
      } else {
        state.messageIdsByChat[chatId] = [messageData.localId];
      }
    },
    updateReadStatusReducer: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
      }>
    ) => {
      const { chatId, userId } = action.payload;

      // Retrieve all message IDs associated with the chat
      const messageIds = state.messageIdsByChat[chatId];

      // Check if there are messages to update
      if (messageIds) {
        // Iterate through each message ID and update the read status
        messageIds.forEach((messageId) => {
          const message = state.messages[messageId];
          if (message && !message.readBy.includes(userId)) {
            // Add the userId to the readBy array if it's not already there
            message.readBy.push(userId);
          }
        });
      }
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

        messages.forEach((message: IMessage) => {
          if (message._id) {
            state.messages[message._id] = message;
            state.messageIdsByChat[chatId]!.push(message._id);
          } else {
            console.error(`Message missing _id: ${JSON.stringify(message)}`);
          }
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
      });
  },
});

export const {
  clearChatData,
  setCurrentChatReducer,
  addMessageReducer,
  updateReadStatusReducer,
  markMessagesAsReadReducer,
  sendMessageReducer,
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
