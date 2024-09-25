import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  addChatReducer,
  addMessageReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice";
import { fetchAllChatsThunk } from "../features/chat/chatThunks";
import { fetchUsersByIds } from "../features/users/userSlice";
import { IChat, IMessage } from "../models/dataModels";
import { webSocketService } from "../services/webSocketService";

// Create a Redux middleware that listens for specific actions and executes side effects.
const listenerMiddleware = createListenerMiddleware();

// Queues for batching updates before sending them via WebSocket
let readStatusQueue: Array<{ chatId: string; userId: string, messageIds: string[] }> = [];
let messageQueue: Array<{ chatId: string; messageData: IMessage }> = [];
let chatQueue: Array<IChat> = [];

// Timers for debouncing WebSocket messages to avoid excessive traffic
let readStatusTimer: NodeJS.Timeout | null = null;
let messageTimer: NodeJS.Timeout | null = null;
let chatTimer: NodeJS.Timeout | null = null;

// Debounce time in milliseconds to group similar WebSocket messages
const DEBOUNCE_TIME = 100;

/**
 * Function to process read status updates in batches.
 * This function sends each read status update through WebSocket individually.
 * The queue is cleared after processing.
 */
const processReadStatusQueue = () => {
  if (readStatusQueue.length > 0) {
    readStatusQueue.forEach(({ chatId, userId, messageIds }) => {
      webSocketService.emitMessageRead(chatId,userId, messageIds);
    });
    readStatusQueue = []; // Clear the queue after processing
  }
};

/**
 * Function to process outgoing messages in batches.
 * This function sends each message through WebSocket individually.
 * The queue is cleared after processing.
 */
const processMessageQueue = () => {
  if (messageQueue.length > 0) {
    messageQueue.forEach(({ chatId, messageData }) => {
      webSocketService.emitNewMessage(chatId, messageData);
    });
    messageQueue = []; // Clear the queue after processing
  }
};

/**
 * Function to process new chat creation in batches.
 * This function sends each new chat through WebSocket individually.
 * The queue is cleared after processing.
 */
const processChatQueue = () => {
  if (chatQueue.length > 0) {
    chatQueue.forEach((chatData) => {
      webSocketService.emitNewChat(chatData);
    });
    chatQueue = []; // Clear the queue after processing
  }
};

// Listener for the updateReadStatusReducer action
listenerMiddleware.startListening({
  actionCreator: updateReadStatusReducer,
  effect: async (action) => {
    const { chatId, userId,messageIds, fromServer } = action.payload;

    // Skip WebSocket emission if action is from the server
    if (fromServer) return;

    // Add the read status update to the queue
    readStatusQueue.push({ chatId, userId, messageIds });

    // Debounce the processing of the read status queue
    if (readStatusTimer) clearTimeout(readStatusTimer);
    readStatusTimer = setTimeout(processReadStatusQueue, DEBOUNCE_TIME);
  },
});

// Listener for the addMessageReducer action
listenerMiddleware.startListening({
  actionCreator: addMessageReducer,
  effect: async (action) => {
    const { chatId, message, fromServer } = action.payload;

    // Skip WebSocket emission if action is from the server
    if (fromServer) return;

    // Add the message to the queue
    messageQueue.push({ chatId, messageData: message });

    // Debounce the processing of the message queue
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(processMessageQueue, DEBOUNCE_TIME);
  },
});

// Listener for the addChatReducer action
listenerMiddleware.startListening({
  actionCreator: addChatReducer,
  effect: async (action) => {
    const { chat, fromServer } = action.payload;

    // Skip WebSocket emission if action is from the server
    if (fromServer) return;

    // Add the chat to the queue
    chatQueue.push(chat);

    // Debounce the processing of the chat queue
    if (chatTimer) clearTimeout(chatTimer);
    chatTimer = setTimeout(processChatQueue, DEBOUNCE_TIME);
  },
});

// Listener for the fetchAllChatsThunk action, triggered after fetching all chats
listenerMiddleware.startListening({
  actionCreator: fetchAllChatsThunk.fulfilled,
  effect: async (action, listenerApi) => {
    const chats = action.payload;

    // Collect unique participant IDs from all chats
    const participantIds = new Set<string>();
    chats.forEach((chat: IChat) => {
      chat.participants.forEach((userId) => participantIds.add(userId));
    });

    // Dispatch an action to fetch user data for all participants
    if (participantIds.size > 0) {
      listenerApi.dispatch(fetchUsersByIds(Array.from(participantIds)));
    }
  },
});

export default listenerMiddleware;
