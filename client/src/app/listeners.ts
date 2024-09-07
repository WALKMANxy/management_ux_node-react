import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  fetchAllChats,
  markMessagesAsReadReducer,
  sendMessageReducer,
} from "../features/chat/chatSlice";
import { IMessage } from "../models/dataModels";
import { webSocketService } from "../services/webSocketService"; // Correct the import path
import { fetchUsersByIds } from "../features/users/userSlice";

const listenerMiddleware = createListenerMiddleware();

// Queue to batch read status updates
let readStatusQueue: Array<{ chatId: string }> = [];
let messageQueue: Array<{ chatId: string; messageData: IMessage }> = [];

// Timers for debouncing
let readStatusTimer: NodeJS.Timeout | null = null;
let messageTimer: NodeJS.Timeout | null = null;

// Debounce time in milliseconds
const DEBOUNCE_TIME = 100;

// Function to process read status updates in batches
// Function to process read status updates in batches
const processReadStatusQueue = () => {
  if (readStatusQueue.length > 0) {
    // Get unique chat IDs to avoid redundant emits for the same chat
    const uniqueChatIds = Array.from(
      new Set(readStatusQueue.map((item) => item.chatId))
    );

    // Emit read status updates per chat
    uniqueChatIds.forEach((chatId) => {
      webSocketService.emitMessageRead(chatId);
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

    // Clear the queue after processing
    messageQueue = [];
  }
};

// Listener for sendMessage action
listenerMiddleware.startListening({
  actionCreator: sendMessageReducer, // Listen for the reducer action
  effect: async (action) => {
    const { chatId, messageData } = action.payload;

    // Add message to queue
    messageQueue.push({ chatId, messageData });

    // Clear existing timer if any and set a new debounce timer
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(processMessageQueue, DEBOUNCE_TIME);
  },
});

// Listener for markMessagesAsReadReducer
listenerMiddleware.startListening({
  actionCreator: markMessagesAsReadReducer,
  effect: async (action) => {
    const { chatId } = action.payload;

    // Add chatId to the queue
    readStatusQueue.push({ chatId });

    // Clear existing timer if any and set a new debounce timer
    if (readStatusTimer) clearTimeout(readStatusTimer);
    readStatusTimer = setTimeout(processReadStatusQueue, DEBOUNCE_TIME);
  },
});

listenerMiddleware.startListening({
  actionCreator: fetchAllChats.fulfilled,
  effect: async (action, listenerApi) => {
    const chats = action.payload;

    // Extract all unique participant IDs from chats
    const participantIds = new Set<string>();
    chats.forEach((chat) => {
      chat.participants.forEach((userId) => participantIds.add(userId));
    });

    // Dispatch an action to fetch details of all participants
    if (participantIds.size > 0) {
      listenerApi.dispatch(fetchUsersByIds(Array.from(participantIds)));
    }
  },
});

export default listenerMiddleware;
