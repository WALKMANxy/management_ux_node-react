import { t } from "i18next";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { AppStore } from "../app/store";
import { getApiUrl } from "../config/config";
import { handleLogout } from "../features/auth/authThunks";
import { fetchChatById } from "../features/chat/api/chats";
import {
  addChatReducer,
  addMessageReducer,
  updateChatReducer,
  updateReadStatusReducer,
  uploadFailed,
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
  private maxReconnectAttempts = 15;

  // Queues to handle offline updates
  private offlineReadStatusQueue: ReadStatusQueueItem[] = [];
  private offlineMessageQueue: MessageQueueItem[] = [];
  private offlineChatQueue: ChatQueueItem[] = [];
  private offlineUpdateChatQueue: Array<{
    chatId: string;
    updatedData: Partial<IChat>;
  }> = [];

  private offlineAutomatedMessageQueue: AutomatedMessageQueueItem[] = [];
  private connectionLostToastId = "connectionLostToast";

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
        authorization: `Bearer ${accessToken}`,
      },
      reconnection: true, // Enable reconnection
      reconnectionAttempts: this.maxReconnectAttempts, // Set maximum attempts
      reconnectionDelay: 5000, // Initial delay before reconnection
      reconnectionDelayMax: 30000, // Maximum delay between attempts
      autoConnect: false, // Control when to connect
    });

    this.setupEventListeners();
    this.socket.connect(); // Initiate the connection
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
    this.socket.on("reconnect_error", (error) => {
      if (error.message === "Unauthorized") {
        this.handleTokenExpiry();
      }
    });

    // Handle reconnection attempts
    this.socket.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
      // Optionally, update UI or state
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Reconnection attempts failed.");
      // Show a persistent error or prompt the user
      toast.error(t("webSocketService.connectionLost"), {
        id: this.connectionLostToastId,
      });
    });

    // Handle successful reconnection
    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      // Dismiss any existing connection lost toasts
      toast.dismiss(this.connectionLostToastId);
      // Optionally, show a success toast
      toast.success(t("webSocketService.reconnected"), {
        id: "reconnectedToast",
      });
      // Flush the offline queues
      this.flushOfflineQueues();
    });

    // Handle incoming chat events
    this.socket.on("chat:newMessage", this.handleNewMessage);
    this.socket.on("chat:messageRead", this.handleMessageRead);
    this.socket.on("chat:newChat", this.handleNewChat);
    this.socket.on("chat:updatedChat", this.handleUpdatedChat);
  }

  private handleConnect = () => {
    console.log("WebSocket connected.");
    // Dismiss any connection lost toasts
    toast.dismiss(this.connectionLostToastId);
    // Optionally, show a connected toast

    // Flush the offline queues
    this.flushOfflineQueues();
  };

  private handleDisconnect = (reason: string) => {
    console.warn(`WebSocket disconnected: ${reason}`);
    // Show a connection lost toast if not already shown
    if (!toast(this.connectionLostToastId)) {
      toast.error(t("webSocketService.lostConnection"), {
        id: this.connectionLostToastId,
        duration: Infinity, // Keep it until dismissed
      });
    }
  };

  private handleConnectError = (error: Error) => {
    console.error("WebSocket connection error:", error);
    // Optionally, show an error toast
    if (!toast(this.connectionLostToastId)) {
      toast.error(t("webSocketService.connectionError"), {
        id: this.connectionLostToastId,
        duration: Infinity,
      });
    }
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
            authorization: `Bearer ${newAccessToken}`,
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

  private flushOfflineQueues() {
    // Flush read status updates
    this.offlineReadStatusQueue.forEach(({ chatId, messageIds }) => {
      this.emitMessageRead(chatId, messageIds);
    });
    this.offlineReadStatusQueue = [];

    // Flush queued messages
    this.offlineMessageQueue.forEach(({ chatId, message }) => {
      this.emitNewMessage(chatId, message);
    });
    this.offlineMessageQueue = [];

    // Flush queued chat creations
    this.offlineChatQueue.forEach(({ chat }) => {
      this.emitNewChat(chat);
    });
    this.offlineChatQueue = [];

    this.offlineUpdateChatQueue.forEach(({ chatId, updatedData }) => {
      this.emitUpdateChat(chatId, updatedData);
    });
    this.offlineUpdateChatQueue = [];

    // Flush queued automated messages
    this.offlineAutomatedMessageQueue.forEach(({ targetIds, message }) => {
      this.emitAutomatedMessage(targetIds, message);
    });
    this.offlineAutomatedMessageQueue = [];
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
      updateReadStatusReducer({
        chatId,
        userId,
        messageIds,
        fromServer: true,
      })
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
        // Chat does not exist, add it directly
        store.dispatch(addChatReducer({ chat, fromServer: true }));
      } catch (error) {
        console.error("Failed to add chat:", error);
      }
    }
  };

  // **New** Handle incoming updated chat event from the server
  public handleUpdatedChat = async ({ chat }: { chat: IChat }) => {
    if (!store) {
      console.error("Store has not been injected into WebSocketService.");
      return;
    }

    const state = store.getState(); // Replace RootState with your actual root state type
    const existingChat = chat._id && state.chats.chats[chat._id];

    if (existingChat) {
      // Update the chat with the new data from the server
      store.dispatch(
        updateChatReducer({
          chatId: chat._id!,
          updatedData: chat,
          fromServer: true,
        })
      );
    } else {
      console.warn(
        `handleUpdatedChat: Chat with ID ${chat._id} not found in the store.`
      );
      // Optionally, you can decide to add the chat if it's not present
      // this.store.dispatch(addChatReducer({ chat, fromServer: true }));
    }
  };

  // Emit a new message to the server
  public emitNewMessage(chatId: string, message: IMessage) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing outgoing message.");
      this.offlineMessageQueue.push({ chatId, message });

      // Dispatch uploadFailed reducer immediately if offline
      store.dispatch(
        uploadFailed({ chatId, messageId: message.local_id || message._id })
      );
      return;
    }

    // Send the message and wait for acknowledgment from the server
    this.socket.emit(
      "chat:message",
      { chatId, message },
      (ack: { success: boolean }) => {
        if (!ack.success) {
          console.warn("Message delivery failed. Queuing message.");
          this.offlineMessageQueue.push({ chatId, message });

          // Dispatch uploadFailed reducer if the server fails to acknowledge the message
          store.dispatch(
            uploadFailed({ chatId, messageId: message.local_id || message._id })
          );
        }
      }
    );

    // Optionally, you can also implement a timeout for acknowledgment
    setTimeout(() => {
      const isMessagePending = this.offlineMessageQueue.find(
        (msg) => msg.message.local_id === message.local_id
      );
      if (isMessagePending) {
        console.warn("Message acknowledgment timeout. Marking as failed.");
        store.dispatch(
          uploadFailed({ chatId, messageId: message.local_id || message._id })
        );
      }
    }, 5000); // 5 seconds timeout for acknowledgment
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

  // Emit a chat update event to the server
  public emitUpdateChat(chatId: string, updatedData: Partial<IChat>) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing outgoing chat update.");
      this.offlineUpdateChatQueue.push({ chatId, updatedData });
      return;
    }

    this.socket.emit("chat:edit", { chatId, updatedData });
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
      this.socket.off("connect_error", this.handleConnectError);
      this.socket.off("reconnect_error");
      this.socket.off("reconnect_attempt");
      this.socket.off("reconnect_failed");
      this.socket.off("reconnect");
      this.socket.off("chat:newMessage", this.handleNewMessage);
      this.socket.off("chat:messageRead", this.handleMessageRead);
      this.socket.off("chat:newChat", this.handleNewChat);
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService();
