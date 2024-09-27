import { io, Socket } from "socket.io-client";
import { AppStore } from "../app/store";
import { getApiUrl } from "../config/config";
import { fetchChatById } from "../features/chat/api/chats";
import {
  addChatReducer,
  addMessageReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice";
import { IChat, IMessage } from "../models/dataModels";
import { handleNewNotification } from "./notifications";

// Define a variable to hold the store reference
let store: AppStore;

const apiUrl = getApiUrl();

if (!apiUrl) {
  console.error("API URL is not defined inside webSocket.ts.");
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Queues to handle offline updates
  private offlineReadStatusQueue: Array<{
    chatId: string;
    messageIds: string[];
  }> = [];
  private offlineMessageQueue: Array<{ chatId: string; message: IMessage }> =
    [];
  private offlineChatQueue: Array<{ chat: IChat }> = [];

  // Inject the store reference at runtime
  injectStore(_store: AppStore) {
    store = _store;
  }

  connect() {
    this.socket = io(apiUrl, {
      withCredentials: true, // This allows the cookie to be sent
      transports: ["websocket"],
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Handle connection events
    this.socket.on("connect", this.handleConnect);
    this.socket.on("disconnect", this.handleDisconnect);
    this.socket.on("connect_error", this.handleConnectError);

    // Handle incoming chat events
    this.socket.on("chat:newMessage", this.handleNewMessage);
    this.socket.on("chat:messageRead", this.handleMessageRead);
    this.socket.on("chat:newChat", this.handleNewChat);
  }

  // On connect, flush the offline queues
  private handleConnect = () => {
    /*     console.log("WebSocket connected");
     */ this.reconnectAttempts = 0;

    // Flush read status updates
    while (this.offlineReadStatusQueue.length > 0) {
      const { chatId, messageIds } = this.offlineReadStatusQueue.shift()!;
      this.emitMessageRead(chatId, messageIds);
    }

    // Flush queued messages
    while (this.offlineMessageQueue.length > 0) {
      const { chatId, message } = this.offlineMessageQueue.shift()!;
      this.emitNewMessage(chatId, message);
    }

    // Flush queued chat creations
    while (this.offlineChatQueue.length > 0) {
      const { chat } = this.offlineChatQueue.shift()!;
      this.emitNewChat(chat);
    }


  };

  private handleDisconnect = () => {
    /*     console.log(`WebSocket disconnected: ${reason}`);
     */ this.tryReconnect();
  };

  private handleConnectError = (error: Error) => {
    console.error("WebSocket connection error:", error);
    this.tryReconnect();
  };

  private tryReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.socket?.connect(), 5000 * this.reconnectAttempts);
    } else {
      console.error(
        "Max reconnection attempts reached. Please refresh the page."
      );
    }
  }

  // Handle incoming new message event
  public handleNewMessage = async ({
    chatId,
    message,
  }: {
    chatId: string;
    message: IMessage;
  }) => {
    if (!store) {
      console.error("Store has not been injected into WebSocketService.");
      return;
    }

    // Access the current state to check if the chat exists
    const state = store.getState();
    const chatExists = state.chats.chats[chatId];
    const currentChatId = state.chats.currentChat?._id; // Access the currently opened chat ID
    const currentUserId = state.auth.userId; // Access the current user ID

    if (!chatExists) {
      // Chat does not exist, fetch the entire chat data
      /*       console.log(`Chat with ID ${chatId} not found. Fetching chat data...`);
       */
      try {
        const chat = await fetchChatById(chatId);
        store.dispatch(addChatReducer({ chat }));
      } catch (error) {
        console.error("Failed to fetch and add chat:", error);
      }
    } else {
      // Add a slight delay before dispatching the server-confirmed message
      setTimeout(() => {
        // Chat exists, dispatch the action to add the message as usual
        store.dispatch(
          addMessageReducer({ chatId, message, fromServer: true })
        );
        if (message.sender !== currentUserId) {
          console.log("handleNewMessage: Dispatching notification for message:", message);
          handleNewNotification(message.sender, message.content, state); // Call the notification handler
        }
        // Wait for the message to be fully added to the server
        setTimeout(() => {
          // Check if the message is part of the currently opened chat and hasn't been read
          if (
            currentChatId === chatId && // Check if the message belongs to the current chat
            message.sender !== currentUserId && // Ensure it's a received message
            !message.readBy.includes(currentUserId) // Check if it hasn't been read by the current user
          ) {
            // Dispatch the read status update
            store.dispatch(
              updateReadStatusReducer({
                chatId,
                userId: currentUserId,
                messageIds: [message.local_id || message._id], // Update the read status of the new message
              })
            );

            // Show notification if the sender is not the current user
          }
        }, 50); // Add an additional delay to ensure the server processes the message
      }, 50); // Initial delay for adding the message
    }
  };

  // Handle incoming message read event
  public handleMessageRead = ({
    chatId,
    userId,
    messageIds,
  }: {
    chatId: string;
    userId: string;
    messageIds: string[];
  }) => {
    if (!store) {
      console.error("Store has not been injected into WebSocketService.");
      return;
    }

    // Dispatch the action to update the read status in local state with message IDs
    store.dispatch(
      updateReadStatusReducer({ chatId, userId, messageIds, fromServer: true })
    );
  };

  // Handle incoming new chat event from the server
  public handleNewChat = async ({ chat }: { chat: IChat }) => {
    if (!store) {
      console.error("Store has not been injected into WebSocketService.");
      return;
    }

    // Access the current state to check if the chat exists
    const state = store.getState();
    const existingLocalChat = state.chats.chats[chat._id || chat.local_id];

    if (existingLocalChat) {
      // Update the chat with server-confirmed data
      store.dispatch(addChatReducer({ chat, fromServer: true }));
    } else {
      try {
        // Chat does not exist, fetch the chat data if needed
        // Alternatively, if chat fetching is unnecessary, you could simply add it
        store.dispatch(addChatReducer({ chat, fromServer: true }));
      } catch (error) {
        console.error("Failed to fetch and add chat:", error);
      }
    }
  };

  // Emit a new message to the server
  public emitNewMessage(chatId: string, message: IMessage) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing outgoing message.");
      this.offlineMessageQueue.push({ chatId, message });
      return;
    }

    this.socket.emit("chat:message", { chatId, message });
  }

  // Emit a message read event to the server
  public emitMessageRead(chatId: string, messageIds: string[]) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing read status update.");
      this.offlineReadStatusQueue.push({ chatId, messageIds });
      return;
    }

    this.socket.emit("chat:read", { chatId, messageIds });
  }

  // Emit a new chat creation event to the server
  public emitNewChat(chat: IChat) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing outgoing chat creation.");
      this.offlineChatQueue.push({ chat });
      return;
    }

    this.socket.emit("chat:create", { chat });
  }

  // Clean up and disconnect
  disconnect() {
    if (this.socket) {
      this.socket.off("connect", this.handleConnect);
      this.socket.off("disconnect", this.handleDisconnect);
      this.socket.off("chat:newMessage", this.handleNewMessage);
      this.socket.off("chat:messageRead", this.handleMessageRead);
      this.socket.off("connect_error", this.handleConnectError);
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService();
