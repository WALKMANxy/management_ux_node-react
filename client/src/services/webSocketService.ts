import { t } from "i18next";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { AppStore } from "../app/store";
import { getApiUrl } from "../config/config";
import { handleLogout } from "../features/auth/authSlice";
import { fetchChatById } from "../features/chat/api/chats";
import {
  addChatReducer,
  addMessageReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice";
import { IChat, IMessage } from "../models/dataModels";
import { getUniqueIdentifier } from "../utils/cryptoUtils";
import { handleNewNotification } from "./notifications";
import { refreshAccessToken } from "./sessionService";
import { getAccessToken } from "./tokenService";

// Define a variable to hold the store reference
let store: AppStore;

const apiUrl = getApiUrl();

if (!apiUrl) {
  console.error("API URL is not defined inside webSocket.ts.");
}

type ReadStatusQueueItem = {
  chatId: string;
  messageIds: string[];
};

type MessageQueueItem = {
  chatId: string;
  message: IMessage;
};

type ChatQueueItem = {
  chat: IChat;
};

type AutomatedMessageQueueItem = {
  targetIds: string[];
  message: Partial<IMessage>;
};

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 15;

  // Queues to handle offline updates
  private offlineReadStatusQueue: ReadStatusQueueItem[] = [];
  private offlineMessageQueue: MessageQueueItem[] = [];
  private offlineChatQueue: ChatQueueItem[] = [];
  private offlineAutomatedMessageQueue: AutomatedMessageQueueItem[] = [];
  private reconnectToastId: string | null = null;
  private maxReconnectToastId = "maxrectoast";
  private toastId = "reconnectionToast";

  // Inject the store reference at runtime
  injectStore(_store: AppStore) {
    store = _store;
  }

  connect() {
    if (this.socket && this.socket.connected) {
      console.warn("WebSocket is already connected.");
      return;
    }

    const accessToken = getAccessToken(); // Get the current access token

    this.socket = io(apiUrl, {
      withCredentials: true,
      transports: ["websocket"],
      auth: {
        authorization: `Bearer ${accessToken}`, // Correct spelling
      },

    });

    this.setupEventListeners();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Handle connection events
    this.socket.on("connect", this.handleConnect);
    this.socket.on("disconnect", this.handleDisconnect);
    this.socket.on("connect_error", this.handleConnectError);

    // Handle unauthorized reconnect due to token expiry
    this.socket.on("reconnect:unauthorized", this.handleTokenExpiry);

    // Handle incoming chat events
    this.socket.on("chat:newMessage", this.handleNewMessage);
    this.socket.on("chat:messageRead", this.handleMessageRead);
    this.socket.on("chat:newChat", this.handleNewChat);
  }

  // On connect, flush the offline queues
  // On connect, flush the offline queues
  private handleConnect = () => {
    this.reconnectAttempts = 0;

    // Flush read status updates
    for (const { chatId, messageIds } of this.offlineReadStatusQueue) {
      this.emitMessageRead(chatId, messageIds);
    }
    this.offlineReadStatusQueue = [];

    // Flush queued messages
    for (const { chatId, message } of this.offlineMessageQueue) {
      this.emitNewMessage(chatId, message);
    }
    this.offlineMessageQueue = [];

    // Flush queued chat creations
    for (const { chat } of this.offlineChatQueue) {
      this.emitNewChat(chat);
    }
    this.offlineChatQueue = [];

    // Flush queued automated messages
    for (const { targetIds, message } of this.offlineAutomatedMessageQueue) {
      this.emitAutomatedMessage(targetIds, message);
    }
    this.offlineAutomatedMessageQueue = [];
  };

  private handleDisconnect = () => {
    /*     console.log(`WebSocket disconnected: ${reason}`);
     */ this.tryReconnect();
  };

  private handleConnectError = (error: Error) => {
    console.error("WebSocket connection error:", error);
    this.tryReconnect();
  };

  private handleTokenExpiry = async () => {
    console.warn("WebSocket token expired, attempting to refresh token...");

    try {
      // Refresh the access token using your existing refresh mechanism
      const refreshSuccess = await refreshAccessToken();

      if (refreshSuccess) {
        // Update the token and reconnect the WebSocket
        const newAccessToken = getAccessToken();
        const uniqueId = getUniqueIdentifier();

        if (this.socket) {
          this.socket.auth = {
            token: `Bearer ${newAccessToken}`,
            uniqueId,
          };
          this.socket.connect();
        }
      } else {
        console.error("Token refresh failed. Logging out...");
        store.dispatch(handleLogout());
      }
    } catch (error) {
      console.error(
        "Error during token refresh for WebSocket reconnect:",
        error
      );
      store.dispatch(handleLogout()); // Log out user if token refresh fails
    }
  };

  private tryReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      // Show loading toast only once
      if (!this.reconnectToastId) {
        toast.loading(t("webSocketService.lostConnection"), {
          id: this.toastId,
        });
      }

      setTimeout(() => {
        // Check if the token is still valid before reconnecting
        const accessToken = getAccessToken();
        if (accessToken) {
          this.socket?.connect();
        } else {
          this.handleTokenExpiry();
        }
      }, 5000 * this.reconnectAttempts);
    } else {
      console.error(
        "Max reconnection attempts reached. Please refresh the page."
      );

      // Dismiss the reconnect loading toast if it exists
      if (this.reconnectToastId) {
        toast.dismiss(this.reconnectToastId);
        this.reconnectToastId = null;
      }

      // Show error toast
      toast.error(
        t("webSocketService.connectionLost", {
          id: this.maxReconnectToastId,
        })
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
      try {
        const chat = await fetchChatById(chatId);
        store.dispatch(addChatReducer({ chat }));
      } catch (error) {
        console.error("Failed to fetch and add chat:", error);
        return;
      }
    }

    // Add a slight delay before dispatching the server-confirmed message
    setTimeout(() => {
      // Chat exists, dispatch the action to add the message as usual
      store.dispatch(addMessageReducer({ chatId, message, fromServer: true }));
      if (message.sender !== currentUserId) {
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
    const existingLocalChat =
      (chat._id && state.chats.chats[chat._id]) ||
      (chat.local_id && state.chats.chats[chat.local_id]);

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

  public emitAutomatedMessage(targetIds: string[], message: Partial<IMessage>) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing automated message.");
      this.offlineAutomatedMessageQueue.push({ targetIds, message });
      return;
    }

    this.socket.emit("chat:automatedMessage", { targetIds, message });
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
