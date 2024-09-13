import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  addMessageReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice";
import { fetchUsersByIds } from "../features/users/userSlice";
import { IChat, IMessage } from "../models/dataModels";
import { webSocketService } from "../services/webSocketService";
import { fetchAllChatsThunk } from "../features/chat/chatThunks";

const listenerMiddleware = createListenerMiddleware();

// Queues to batch updates
let readStatusQueue: Array<{ chatId: string; messageIds: string[] }> = [];
let messageQueue: Array<{ chatId: string; messageData: IMessage }> = [];

// Timers for debouncing
let readStatusTimer: NodeJS.Timeout | null = null;
let messageTimer: NodeJS.Timeout | null = null;

// Debounce time in milliseconds
const DEBOUNCE_TIME = 100;

// Function to process read status updates in batches
const processReadStatusQueue = () => {
  if (readStatusQueue.length > 0) {
    // Directly emit each read status update without grouping
    readStatusQueue.forEach(({ chatId, messageIds }) => {
      webSocketService.emitMessageRead(chatId, messageIds);
    });

    // Clear the queue after processing
    readStatusQueue = [];
  }
};

// Function to process outgoing messages in batches
const processMessageQueue = () => {
  if (messageQueue.length > 0) {
    messageQueue.forEach(({ chatId, messageData }) => {
      webSocketService.emitNewMessage(chatId, messageData);
    });

    messageQueue = [];
  }
};

// Listener for updateReadStatusReducer
listenerMiddleware.startListening({
  actionCreator: updateReadStatusReducer,
  effect: async (action) => {
    const { chatId, messageIds, fromServer } = action.payload;
    if (fromServer) return; // Skip WebSocket emission if action is from the server

    readStatusQueue.push({ chatId, messageIds });

    if (readStatusTimer) clearTimeout(readStatusTimer);
    readStatusTimer = setTimeout(processReadStatusQueue, DEBOUNCE_TIME);
  },
});

// Listener for addMessageReducer
listenerMiddleware.startListening({
  actionCreator: addMessageReducer,
  effect: async (action) => {
    const { chatId, message, fromServer } = action.payload;
    if (fromServer) return; // Skip WebSocket emission if action is from the server

    messageQueue.push({ chatId, messageData: message });

    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(processMessageQueue, DEBOUNCE_TIME);
  },
});

// Listener for fetchAllChats to fetch users data
listenerMiddleware.startListening({
  actionCreator: fetchAllChatsThunk.fulfilled,
  effect: async (action, listenerApi) => {
    const chats = action.payload;

    const participantIds = new Set<string>();
    chats.forEach((chat: IChat) => {
      chat.participants.forEach((userId) => participantIds.add(userId));
    });

    if (participantIds.size > 0) {
      listenerApi.dispatch(fetchUsersByIds(Array.from(participantIds)));
    }
  },
});

export default listenerMiddleware;
