// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import { createSelector } from "reselect";
import { RootState } from "../../app/store";
import { IChat, IMessage } from "../../models/dataModels";
import {
  createChatThunk,
  createMessageThunk,
  fetchAllChatsThunk,
  fetchMessagesFromMultipleChatsThunk,
  fetchMessagesThunk,
  fetchOlderMessagesThunk,
} from "./chatThunks";

// Define the simplified ChatState without the messages field
interface ChatState {
  chats: Record<string, IChat>; // Store chats by their IDs
  currentChat: IChat | null; // Currently selected chat
  status: "idle" | "loading" | "succeeded" | "failed"; // Status of the chat fetching/operations
  error: string | null; // To store any errors
}

// Define the initial state without the messages field
const initialState: ChatState = {
  chats: {}, // Chats stored by chat ID
  currentChat: null, // No chat selected initially
  status: "idle", // Initial status
  error: null, // No errors initially
};

// Define the chat slice
const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    clearChatData: (state) => {
      state.chats = {};
      state.currentChat = null;
      state.status = "idle";
      state.error = null;
    },
    setCurrentChatReducer: (state, action: PayloadAction<IChat>) => {
      state.currentChat = action.payload;
    },
    // New reducer to clear currentChat
    clearCurrentChatReducer: (state) => {
      state.currentChat = null;
    },
    addMessageReducer: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: IMessage;
        fromServer?: boolean; // Flag to distinguish server-originated actions
      }>
    ) => {
      const { chatId, message } = action.payload;

      // Retrieve the chat from the state
      const chat = state.chats[chatId];

      // Check if the chat exists

      if (!chat) {
        console.error("Chat does not exist in the state.");
        return;
      }

      const existingMessage = chat.messages.find(
        (msg) => msg.local_id === message.local_id
      );

      if (existingMessage) {
        Object.assign(existingMessage, message);
      } else {
        chat.messages.push(message);
      }

      // Sort messages by timestamp
      chat.messages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      chat.updatedAt = new Date();
    },

    updateReadStatusReducer: (
      state,
      action: PayloadAction<{
        chatId: string; // Required for other components
        userId: string;
        messageIds: string[];
        fromServer?: boolean; // Flag to distinguish server-originated actions
      }>
    ) => {
      const { chatId, userId, messageIds } = action.payload;

      // Retrieve the chat from the state
      const chat = state.chats[chatId];

      // Check if the chat exists
      if (!chat) {
        console.error(`Chat with ID ${chatId} does not exist in the state.`);
        return state; // Return the existing state if chat doesn't exist
      }

      chat.messages.forEach((message) => {
        if (messageIds.includes(message.local_id ?? "")) {
          if (!message.readBy.includes(userId)) {
            message.readBy.push(userId);
          }
        }
      });

      chat.updatedAt = new Date();
    },

    addChatReducer: (
      state,
      action: PayloadAction<{
        chat: IChat;
        fromServer?: boolean; // Flag to distinguish server-originated actions
      }>
    ) => {
      const { chat, fromServer } = action.payload;

      const existingChat = state.chats[chat._id || chat.local_id];

      if (existingChat && fromServer) {
        // Update with server-confirmed data
        state.chats[chat._id] = {
          ...existingChat,
          ...chat,
          local_id: chat.local_id,
          _id: chat._id,
          status: chat.status,
        };
        delete state.chats[chat.local_id];
      } else if (!existingChat) {
        // Add new chat
        state.chats[chat.local_id] = chat;
      }
      // If existingChat exists and not from server, do nothing
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
        const chat = state.chats[chatId];
        if (!chat) {
          console.error(`Chat with ID ${chatId} does not exist in the state.`);
          return;
        }

        const messageMap = new Map<string, IMessage>();
        chat.messages.forEach((msg) => {
          if (msg.local_id) {
            messageMap.set(msg.local_id, msg);
          }
        });
        messages.forEach((msg) => {
          if (msg.local_id) {
            messageMap.set(msg.local_id, msg);
          }
        });
        chat.messages = Array.from(messageMap.values()).sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        chat.updatedAt = new Date();
      })
      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch Messages from Multiple Chats
      .addCase(
        fetchMessagesFromMultipleChatsThunk.fulfilled,
        (state, action) => {
          state.status = "succeeded";

          action.payload.forEach(({ chatId, messages }) => {
            const chat = state.chats[chatId];
            if (!chat) {
              console.error(
                `Chat with ID ${chatId} does not exist in the state.`
              );
              return;
            }

            const existingMessagesMap = new Map(
              chat.messages.map((msg) => [msg.local_id, msg])
            );

            messages.forEach((message) => {
              existingMessagesMap.set(message.local_id, {
                ...existingMessagesMap.get(message.local_id),
                ...message,
              });
            });

            chat.messages = Array.from(existingMessagesMap.values()).sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );
            chat.updatedAt = new Date();
          });
        }
      )

      // Fetch Older Messages
      .addCase(fetchOlderMessagesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOlderMessagesThunk.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        const chat = state.chats[chatId];
        if (!chat) return;

        const existingMessageIds = new Set(
          chat.messages.map((msg) => msg._id.toString())
        );
        const newMessages = messages.filter(
          (msg) => !existingMessageIds.has(msg._id.toString())
        );

        chat.messages = [...newMessages.reverse(), ...chat.messages].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        chat.updatedAt = new Date();
      })
      .addCase(fetchOlderMessagesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Create Chat
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
      // Create Message
      .addCase(createMessageThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createMessageThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { chatId, message } = action.payload;
        const chat = state.chats[chatId];
        if (!chat) {
          console.error(`Chat with ID ${chatId} does not exist.`);
          return;
        }

        const existingMessage = chat.messages.find(
          (msg) => msg.local_id === message.local_id
        );

        if (existingMessage) {
          Object.assign(existingMessage, message);
        } else {
          chat.messages.push(message);
        }

        chat.updatedAt = new Date();
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
  clearCurrentChatReducer,
  addMessageReducer,
  updateReadStatusReducer,
  addChatReducer,
} = chatSlice.actions;

export default chatSlice.reducer;

// Memoized selector for all chats
export const selectAllChats = createSelector(
  (state: RootState) => state.chats.chats,
  (chats) => Object.values(chats)
);

// Memoized selector for a specific chat by ID
export const selectChatById = createSelector(
  [
    (state: RootState) => state.chats.chats,
    (_: RootState, chatId: string) => chatId,
  ],
  (chats, chatId) => chats[chatId]
);

// Replace with a simple selector
export const selectCurrentChat = (state: RootState) => state.chats.currentChat;

// Memoized selector for messages from the current chat
export const selectMessagesFromCurrentChat = createSelector(
  selectCurrentChat,
  (currentChat) => currentChat?.messages || []
);

// Replace with a simple selector
export const selectChatsStatus = (state: RootState) => state.chats.status;

// Replace with a simple selector
export const selectChatsError = (state: RootState) => state.chats.error;

// Memoized selector for messages by chat ID
export const selectMessagesByChatId = createSelector(
  [
    (state: RootState) => state.chats.chats,
    (_: RootState, chatId: string) => chatId,
  ],
  (chats, chatId) => chats[chatId]?.messages || []
);

// Memoized selector for unread messages for a specific user in the current chat
export const selectUnreadMessages = createSelector(
  [selectCurrentChat, (_: RootState, userId: string) => userId],
  (currentChat, userId) =>
    currentChat?.messages.filter(
      (message) => !message.readBy.includes(userId) && message.sender !== userId
    ) || []
);
