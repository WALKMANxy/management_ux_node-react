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
        return state; // Return the existing state if chat doesn't exist
      }

      // Create a new messages array with the updated message
      const updatedMessages = [...chat.messages];
      const existingMessageIndex = updatedMessages.findIndex(
        (msg) => msg.local_id === message.local_id
      );

      if (existingMessageIndex !== -1) {
        // Update the existing message
        updatedMessages[existingMessageIndex] = {
          ...updatedMessages[existingMessageIndex],
          ...message,
        };
      } else {
        // Add the new message
        updatedMessages.push(message);
      }

      // Sort the updated messages by timestamp
      updatedMessages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Return a new state object with the updated chat, ensuring immutability
      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: updatedMessages,
            updatedAt: new Date(),
          },
        },
      };
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

      // Create a new array of messages with updated read statuses
      const updatedMessages = chat.messages.map((message) => {
        if (messageIds.includes(message.local_id ?? '')) {          // Create a new message object with updated readBy array if userId is not already included
          return {
            ...message,
            readBy: message.readBy.includes(userId)
              ? message.readBy
              : [...message.readBy, userId],
          };
        }
        return message;
      });

      // Return a new state object with the updated chat, ensuring immutability
      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: updatedMessages,
            updatedAt: new Date(),
          },
        },
      };
    },

    markMessagesAsReadReducer: (
      state,
      action: PayloadAction<{ chatId: string; currentUserId: string }>
    ) => {
      const { chatId, currentUserId } = action.payload;

      // Retrieve the chat by its ID
      const chat = state.chats[chatId];

      // Check if the chat exists
      if (!chat) {
        console.error(`Chat with ID ${chatId} does not exist in the state.`);
        return state; // Return the existing state if chat doesn't exist
      }

      // Create a new array of messages with updated read statuses
      const updatedMessages = chat.messages.map((message) => {
        // Ensure the message is not sent by the current user and hasn't been marked as read by them
        if (
          message.sender !== currentUserId &&
          !message.readBy.includes(currentUserId)
        ) {
          // Return a new message object with updated readBy array
          return {
            ...message,
            readBy: [...message.readBy, currentUserId],
          };
        }
        return message;
      });

      // Return a new state object with the updated chat, ensuring immutability
      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: updatedMessages,
            updatedAt: new Date(),
          },
        },
      };
    },

    addChatReducer: (state, action: PayloadAction<IChat>) => {
      const chat = action.payload;

      // Return a new state object with the added chat, ensuring immutability
      return {
        ...state,
        chats: {
          ...state.chats,
          [chat._id]: chat, // Add the new chat using its _id as the key
        },
        status: "succeeded", // Update status to reflect successful addition
      };
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
        state.status = "succeeded"; // Update the status to reflect success
        const { chatId, messages } = action.payload;

        // Ensure the chat exists in the state
        const chat = state.chats[chatId];
        if (!chat) {
          console.error(`Chat with ID ${chatId} does not exist in the state.`);
          return;
        }

        // Combine existing messages with the newly fetched messages
        const combinedMessages = [...chat.messages, ...messages];

        // Create a map to eliminate duplicates, using local_id as the key
        const messageMap = new Map();
        combinedMessages.forEach((message) => {
          messageMap.set(message.local_id, message);
        });

        // Convert the map back to an array and sort by timestamp
        const sortedMessages = Array.from(messageMap.values()).sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Update the state immutably
        state.chats = {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages: sortedMessages, // Ensure a new reference for the messages array
          },
        };

        // Optional: Log the updated chat object for debugging purposes
        console.log(
          `Messages updated for chat with ID: ${chatId}`,
          sortedMessages
        );
      })

      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle fetchMessagesFromMultipleChatsThunk
      .addCase(
        fetchMessagesFromMultipleChatsThunk.fulfilled,
        (state, action) => {
          state.status = "succeeded"; // Update status to indicate success

          // Create a copy of the chats to avoid direct mutations
          const updatedChats = { ...state.chats };

          // Iterate over each chat's messages from the payload
          action.payload.forEach(({ chatId, messages }) => {
            // Ensure the chat exists in the copied state
            const chat = updatedChats[chatId];
            if (!chat) {
              console.error(
                `Chat with ID ${chatId} does not exist in the state.`
              );
              return;
            }

            // Create a map of existing messages for quick lookups by local_id
            const existingMessagesMap = new Map(
              chat.messages.map((msg) => [msg.local_id, msg])
            );

            // Merge or update the fetched messages
            messages.forEach((message) => {
              existingMessagesMap.set(message.local_id, {
                ...existingMessagesMap.get(message.local_id),
                ...message,
              });
            });

            // Update the chat messages by converting the map back to an array
            updatedChats[chatId] = {
              ...chat,
              messages: Array.from(existingMessagesMap.values()).sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              ),
            };

            // Optional: Log the updated state for debugging purposes
            console.log(
              `Updated chat with ID: ${chatId} - Messages count: ${updatedChats[chatId].messages.length}`
            );
          });

          // Assign the updated chats back to the state
          state.chats = updatedChats;
        }
      )

      .addCase(fetchOlderMessagesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchOlderMessagesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(
        fetchOlderMessagesThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ chatId: string; messages: IMessage[] }>
        ) => {
          const { chatId, messages } = action.payload;

          if (!state.chats[chatId]) return;

          // Filter out duplicates before adding new messages
          const existingMessageIds = new Set(
            state.chats[chatId].messages.map((msg) => msg._id.toString())
          );
          const newMessages = messages.filter(
            (msg) => !existingMessageIds.has(msg._id.toString())
          );

          // Add new messages and sort by timestamp to maintain order
          state.chats[chatId].messages = [
            ...newMessages.reverse(), // Reverse the new messages to maintain chronological display
            ...state.chats[chatId].messages,
          ].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ); // Sort by timestamp
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
        state.status = "succeeded"; // Update status to indicate the action was successful
        const { chatId, message } = action.payload;

        // Find the chat by its ID
        const chat = state.chats[chatId];
        if (!chat) {
          console.error(`Chat with ID ${chatId} does not exist.`);
          return;
        }

        // Use local_id for consistency and prevent duplicates
        const existingMessageIndex = chat.messages.findIndex(
          (msg) => msg.local_id === message.local_id
        );

        if (existingMessageIndex === -1) {
          // If the message does not exist, add it to the chat's messages array
          chat.messages.push(message);
          console.log(`Message added to chat ${chatId}`);
        } else {
          // If the message exists, update the existing message
          chat.messages[existingMessageIndex] = message;
          console.log(`Message updated in chat ${chatId}`);
        }

        // Optional: Log the updated state for debugging purposes
        console.log(
          `Updated chat with ID: ${chatId} - Messages count: ${chat.messages.length}`
        );
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
  markMessagesAsReadReducer,
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

// Memoized selector for the current chat
export const selectCurrentChat = createSelector(
  (state: RootState) => state.chats.currentChat,
  (currentChat) => currentChat
);

// Memoized selector for messages from the current chat
export const selectMessagesFromCurrentChat = createSelector(
  selectCurrentChat,
  (currentChat) => currentChat?.messages || []
);

// Memoized selector for the chat operation status (loading, succeeded, failed)
export const selectChatsStatus = createSelector(
  (state: RootState) => state.chats.status,
  (status) => status
);

// Memoized selector for the error state
export const selectChatsError = createSelector(
  (state: RootState) => state.chats.error,
  (error) => error
);

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
