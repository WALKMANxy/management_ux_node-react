// src/features/chat/chatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import { createSelector } from "reselect";
import { RootState } from "../../app/store";
import { Attachment, IChat, IMessage } from "../../models/dataModels";
import {
  createChatThunk,
  createMessageThunk,
  fetchAllChatsThunk,
  fetchMessagesFromMultipleChatsThunk,
  fetchMessagesThunk,
  fetchOlderMessagesThunk,
} from "./chatThunks";

interface ChatState {
  chats: Record<string, IChat>;
  currentChat: IChat | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  fetchChatsStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Define the initial state without the messages field
const initialState: ChatState = {
  chats: {},
  currentChat: null,
  status: "idle",
  fetchChatsStatus: "idle",

  error: null,
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
    setCurrentChatById: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      const chat = state.chats[chatId];

      if (chat) {
        state.currentChat = chat;
      } else {
        console.error(`Chat with ID ${chatId} does not exist in the state.`);
        state.currentChat = null;
      }
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
        fromServer?: boolean;
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
    addAttachmentMessageReducer: (
      state,
      action: PayloadAction<{ chatId: string; message: IMessage }>
    ) => {
      const { chatId, message } = action.payload;
      const chat = state.chats[chatId];

      if (!chat) {
        console.error("Chat does not exist in the state.");
        return;
      }

      // Initialize uploadProgress and status
      const initializedMessage: IMessage = {
        ...message,
        attachments: message.attachments.map((attachment) => ({
          ...attachment,
          uploadProgress: 0,
          status: "pending",
        })),
        isUploading: true,
      };
      // Push the modified message to the chat
      chat.messages.push(initializedMessage);
      chat.updatedAt = new Date();
    },
    // Updates the upload progress of a specific attachment
    updateAttachmentProgress: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageLocalId: string;
        attachmentFileName: string;
        progress: number;
      }>
    ) => {
      const { chatId, messageLocalId, attachmentFileName, progress } =
        action.payload;
      const chat = state.chats[chatId];
      if (!chat) {
        console.error("Chat does not exist in the state.");
        return;
      }
      const message = chat.messages.find(
        (msg) => msg.local_id === messageLocalId
      );
      if (message) {
        const attachment = message.attachments.find(
          (att) => att.fileName === attachmentFileName
        );
        if (attachment) {
          // Set the status to "uploading" as soon as progress starts
          if (progress > 0 && progress < 100) {
            attachment.status = "uploading";
          }

          // Update the progress
          attachment.uploadProgress = progress;

          if (progress === 100) {
            attachment.status = "uploaded";
          }
        }
      }
    },

    // Marks the upload as failed for a specific attachment
    uploadAttachmentFailed: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageLocalId: string;
        attachmentFileName: string;
      }>
    ) => {
      const { chatId, messageLocalId, attachmentFileName } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) {
        console.error("Chat does not exist in the state.");
        return;
      }
      const message = chat.messages.find(
        (msg) => msg.local_id === messageLocalId
      );
      if (message) {
        const attachment = message.attachments.find(
          (att) => att.fileName === attachmentFileName
        );
        if (attachment) {
          attachment.uploadProgress = 0;
          attachment.status = "failed";
        }
        // Mark message as failed if any attachment has failed
        message.status = "failed";
        message.isUploading = false;
      }
    },

    // Marks the entire upload as complete for a message
    uploadComplete: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: IMessage;
        fromServer?: boolean;
      }>
    ) => {
      console.log("uploadComplete called");
      const { chatId, message } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) {
        console.error("Chat does not exist in the state.");
        return;
      }
      const existingMessage = chat.messages.find(
        (msg) => msg.local_id === message.local_id
      );
      if (existingMessage) {
        console.log("Marking message as uploaded");
        existingMessage.isUploading = false;
        // Strip the 'file' property from each attachment
        existingMessage.attachments = existingMessage.attachments.map(
          (attachment) => {
            const { file, ...rest } = attachment;
            return {
              ...rest,
            };
          }
        );
      } else {
        console.error("Message does not exist in the state.");
        return;
      }
      // Sort messages by timestamp
      console.log("Sorting messages by timestamp");
      chat.messages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      console.log("Updating chat's updatedAt timestamp");
      chat.updatedAt = new Date();
    },

    updateReadStatusReducer: (
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
        messageIds: string[];
        fromServer?: boolean;
      }>
    ) => {
      const { chatId, userId, messageIds } = action.payload;

      // Retrieve the chat from the state
      const chat = state.chats[chatId];

      // Check if the chat exists
      if (!chat) {
        console.error(`Chat with ID ${chatId} does not exist in the state.`);
        return state;
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
        fromServer?: boolean;
      }>
    ) => {
      const { chat, fromServer } = action.payload;

      if (fromServer && chat._id) {
        const localId = chat.local_id;
        if (localId && state.chats[localId]) {
          // Check if the current chat is the same as the one being updated
          if (state.currentChat?.local_id === localId) {
            // Update the currentChat with the server data
            state.currentChat = {
              ...state.currentChat,
              ...chat,
              _id: chat._id,
              status: chat.status,
            };
          }

          // Replace the chat keyed by local_id with the chat keyed by _id
          state.chats[chat._id] = {
            ...state.chats[localId],
            ...chat,
            _id: chat._id,
            status: chat.status,
          };
          // Remove the old chat entry keyed by local_id
          delete state.chats[localId];
        } else {
          // If no matching local_id, add the chat as a new entry keyed by _id
          state.chats[chat._id] = chat;
        }
      } else {
        // Client-originated chat, add to state keyed by local_id
        const localId = chat.local_id;
        if (localId) {
          state.chats[localId] = chat;
        }
      }
    },

    updateChatReducer: (
      state,
      action: PayloadAction<{
        chatId: string;
        updatedData: Partial<IChat>;
        fromServer?: boolean;
      }>
    ) => {
      const { chatId, updatedData, fromServer } = action.payload;
      const existingChat = state.chats[chatId];

      if (existingChat) {
        state.chats[chatId] = {
          ...existingChat,
          ...updatedData,
          updatedAt: new Date(),
        };
        if (fromServer) {
          // console.log(`updateChatReducer: Chat ${chatId} updated from server.`);
        } else {
          // console.log(`updateChatReducer: Chat ${chatId} updated from client.`);
        }
      } else {
        // console.warn(`updateChatReducer: Chat with ID ${chatId} not found.`);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllChatsThunk.pending, (state) => {
        state.fetchChatsStatus = "loading";
        state.error = null;
      })

      .addCase(fetchAllChatsThunk.fulfilled, (state, action) => {
        state.fetchChatsStatus = "succeeded";
        action.payload.forEach((chat: WritableDraft<IChat>) => {
          state.chats[chat._id!] = chat;
        });
      })

      .addCase(fetchAllChatsThunk.rejected, (state, action) => {
        state.fetchChatsStatus = "failed";
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
        state.chats[newChat._id!] = newChat;
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

// Export actions
export const {
  clearChatData,
  setCurrentChatReducer,
  clearCurrentChatReducer,
  addMessageReducer,
  addAttachmentMessageReducer,
  updateAttachmentProgress,
  uploadAttachmentFailed,
  uploadComplete,
  updateReadStatusReducer,
  addChatReducer,
  updateChatReducer,
  setCurrentChatById,
} = chatSlice.actions;

export default chatSlice.reducer;

export const selectFetchChatsStatus = (state: RootState) =>
  state.chats.fetchChatsStatus;

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

// Selector to get the current chat
export const selectCurrentChat = (state: RootState) => {
  const currentChatId = state.chats.currentChat?._id;
  return currentChatId
    ? state.chats.chats[currentChatId]
    : state.chats.currentChat;
};

// Memoized selector for messages from the current chat
export const selectMessagesFromCurrentChat = createSelector(
  selectCurrentChat,
  (currentChat) => currentChat?.messages || []
);

// Selector to get the current chat status
export const selectChatsStatus = (state: RootState) => state.chats.status;

// Selector to get the current chat error
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
      (message: IMessage) =>
        !message.readBy.includes(userId) && message.sender !== userId
    ) || []
);

// Selector to get an attachment
export const selectAttachment = (
  state: RootState,
  payload: {
    chatId: string;
    messageLocalId: string;
    attachmentFileName: string;
  }
): Attachment | undefined => {
  const { chatId, messageLocalId, attachmentFileName } = payload;
  const chat = state.chats.chats[chatId];
  if (!chat) {
    console.error(`Chat with ID ${chatId} does not exist in the state.`);
    return undefined;
  }
  const message = chat.messages.find((msg) => msg.local_id === messageLocalId);
  if (!message) {
    console.error(
      `Message with local_id ${messageLocalId} does not exist in chat ${chatId}.`
    );
    return undefined;
  }
  const attachment = message.attachments.find(
    (att) => att.fileName === attachmentFileName
  );
  if (!attachment) {
    console.error(
      `Attachment with fileName ${attachmentFileName} does not exist in message ${messageLocalId}.`
    );
  }
  return attachment;
};
