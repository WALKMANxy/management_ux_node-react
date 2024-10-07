import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  addChatReducer,
  addMessageReducer,
  updateChatReducer,
  updateReadStatusReducer,
  uploadComplete,
} from "../features/chat/chatSlice";
import { fetchAllChatsThunk } from "../features/chat/chatThunks";
import {
  createPromoAsync,
  createVisitAsync,
} from "../features/data/dataThunks";
import { fetchUsersByIds, selectAllUsers } from "../features/users/userSlice";
import { IChat, IMessage } from "../models/dataModels";
import { webSocketService } from "../services/webSocketService";
import { generateAutomatedMessage } from "../utils/chatUtils";
import { RootState } from "./store";

// Create a Redux middleware that listens for specific actions and executes side effects.
const listenerMiddleware = createListenerMiddleware();

// Queues for batching updates before sending them via WebSocket
let readStatusQueue: Array<{
  chatId: string;
  userId: string;
  messageIds: string[];
}> = [];
let messageQueue: Array<{ chatId: string; messageData: IMessage }> = [];
let chatQueue: Array<IChat> = [];
let automatedMessageQueue: Array<{
  targetId: string[];
  message: Partial<IMessage>;
}> = [];
let updateChatQueue: Array<{ chatId: string; updatedData: Partial<IChat> }> =
  [];

// Timers for debouncing WebSocket messages to avoid excessive traffic
let readStatusTimer: NodeJS.Timeout | null = null;
let messageTimer: NodeJS.Timeout | null = null;
let chatTimer: NodeJS.Timeout | null = null;
let automatedMessageTimer: NodeJS.Timeout | null = null;
let updateChatTimer: NodeJS.Timeout | null = null;

// Debounce time in milliseconds to group similar WebSocket messages
const DEBOUNCE_TIME = 100;

/**
 * Function to process read status updates in batches.
 * This function sends each read status update through WebSocket individually.
 * The queue is cleared after processing.
 */
const processReadStatusQueue = () => {
  if (readStatusQueue.length > 0) {
    readStatusQueue.forEach(({ chatId, messageIds }) => {
      webSocketService.emitMessageRead(chatId, messageIds);
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

const processUpdateChatQueue = () => {
  if (updateChatQueue.length > 0) {
    updateChatQueue.forEach(({ chatId, updatedData }) => {
      webSocketService.emitUpdateChat(chatId, updatedData);
    });
    updateChatQueue = [];
  }
};

// Function to process automated message dispatch in batches.
const processAutomatedMessageQueue = () => {
  if (automatedMessageQueue.length > 0) {
    automatedMessageQueue.forEach(({ targetId, message }) => {
      // Emit the message to all targetIds at once
      webSocketService.emitAutomatedMessage(targetId, message);
    });
    automatedMessageQueue = []; // Clear the queue after processing
  }
};
// Listener for the updateReadStatusReducer action
listenerMiddleware.startListening({
  actionCreator: updateReadStatusReducer,
  effect: async (action) => {
    const { chatId, userId, messageIds, fromServer } = action.payload;

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

// Listener for the addMessageReducer action
listenerMiddleware.startListening({
  actionCreator: uploadComplete,
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

listenerMiddleware.startListening({
  actionCreator: updateChatReducer,
  effect: async (action) => {
    const { chatId, updatedData, fromServer } = action.payload;

    // Skip WebSocket emission if action is from the server
    if (fromServer) return;

    // Add the chat to the queue
    updateChatQueue.push({ chatId, updatedData });

    // Debounce the processing of the chat queue
    if (updateChatTimer) clearTimeout(updateChatTimer);
    updateChatTimer = setTimeout(processUpdateChatQueue, DEBOUNCE_TIME);
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

listenerMiddleware.startListening({
  actionCreator: createPromoAsync.fulfilled,
  effect: async (action, listenerApi) => {
    const promo = action.payload;

    // Get all users from the user slice
    const allUsers = selectAllUsers(listenerApi.getState() as RootState);

    let targetedUsers = [];

    // If the promo is global, target all clients
    if (promo.global) {
      targetedUsers = allUsers.filter(
        (user) =>
          user.role === "client" &&
          user.entityCode !== undefined &&
          !promo.excludedClientsId?.includes(user.entityCode)
      );
    } else {
      targetedUsers = allUsers.filter(
        (user) =>
          user.role === "client" &&
          user.entityCode !== undefined &&
          promo.clientsId.includes(user.entityCode)
      );
    }

    // Generate the automated message only once
    const messageData = generateAutomatedMessage(promo);

    // Add the automated message to the queue for all targeted users
    targetedUsers.forEach((user) => {
      if (!user?._id) {
        console.error("No user found with the given clientId");
        return;
      }

      automatedMessageQueue.push({
        targetId: [user._id], // Ensure targetId is an array of strings
        message: messageData, // Ensure message is an array of message objects
      });
    });

    // Debounce the processing of the automated message queue
    if (automatedMessageTimer) clearTimeout(automatedMessageTimer);
    automatedMessageTimer = setTimeout(
      processAutomatedMessageQueue,
      DEBOUNCE_TIME
    );
  },
});

// Listener for the createVisitAsync action
listenerMiddleware.startListening({
  actionCreator: createVisitAsync.fulfilled,
  effect: async (action, listenerApi) => {
    const visit = action.payload;

    const allUsers = selectAllUsers(listenerApi.getState() as RootState);

    // Find the user based on the entityCode (which corresponds to the clientId)
    const targetedUser = allUsers.find(
      (user) => user.role === "client" && user.entityCode === visit.clientId
    );

    if (!targetedUser?._id) {
      console.error("No user found with the given clientId");
      return;
    }

    const messageData = generateAutomatedMessage(visit);

    // Add the automated message to the queue
    automatedMessageQueue.push({
      targetId: [targetedUser._id],
      message: messageData,
    });

    // Debounce the processing of the automated message queue
    if (automatedMessageTimer) clearTimeout(automatedMessageTimer);
    automatedMessageTimer = setTimeout(
      processAutomatedMessageQueue,
      DEBOUNCE_TIME
    );
  },
});

export default listenerMiddleware;
