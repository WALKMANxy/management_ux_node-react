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
  private listenersSetUp = false;

  // Queues to handle offline updates with size limits
  private readonly MAX_QUEUE_SIZE = 100;
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
  private isConnectionLost = false;


  // Inject the store reference at runtime
  injectStore(_store: AppStore) {
    store = _store;
  }

  // To manage timeouts
  private timeoutIds: NodeJS.Timeout[] = [];

  // Handle visibility changes
  private handleVisibilityChange = () => {
    if (
      document.visibilityState === "visible" &&
      this.socket &&
      !this.socket.connected
    ) {
      console.log("Tab is visible. Attempting to reconnect WebSocket.");
      this.socket.connect();
    }
  };

  private enqueue<T>(queue: T[], item: T) {
    if (queue.length >= this.MAX_QUEUE_SIZE) {
      console.warn("Queue max size reached. Discarding oldest item.");
      queue.shift(); // Remove the oldest item
    }
    queue.push(item);
  }

  connect() {
    if (this.socket && this.socket.connected) {
      console.warn("WebSocket is already connected.");
      return;
    }

    if (this.socket && !this.socket.connected && this.listenersSetUp) {
      // Reuse existing socket without setting up listeners again
      this.socket.connect();
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
      autoConnect: false, // Control when to connect
    });

    this.setupEventListeners();
    this.listenersSetUp = true;
    this.socket.connect(); // Initiate the connection

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
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
    this.socket.on("reconnect:unauthorized", this.handleReconnectUnauthorized);

    // Handle reconnection attempts
    this.socket.on("reconnect_attempt", () => {
      // console.log(`Reconnection attempt ${attempt}`);
      // Optionally, update UI or state
    });

    // Handle incoming chat events
    this.socket.on("chat:newMessage", this.handleNewMessage);
    this.socket.on("chat:messageRead", this.handleMessageRead);
    this.socket.on("chat:newChat", this.handleNewChat);
    this.socket.on("chat:updatedChat", this.handleUpdatedChat);
  }

// Modify handleDisconnect
private handleDisconnect = (reason: string) => {
  console.warn(`WebSocket disconnected: ${reason}`);

  if (!this.isConnectionLost) {
    // Show a loading toast indicating connection loss
    toast.loading(t("webSocketService.lostConnection"), {
      id: this.connectionLostToastId,
      duration: Infinity,
    });
    this.isConnectionLost = true;
  }
};

// Modify handleConnect
private handleConnect = () => {
  console.log("WebSocket connected.");

  if (this.isConnectionLost) {
    // Dismiss the connection lost toast if it's active
    toast.dismiss(this.connectionLostToastId);
    this.isConnectionLost = false;
  }

  // Show a success toast
  toast.success(t("webSocketService.connected"), {
    duration: 500,
  });

  this.flushOfflineQueues();
};

// Optionally, handle specific connect_error
private handleConnectError = (error: Error) => {
  console.error("WebSocket connection error:", error);

  if (!this.isConnectionLost) {
    // Show a loading toast indicating connection loss
    toast.loading(t("webSocketService.connectionLost"), {
      id: this.connectionLostToastId,
      duration: Infinity,
    });
    this.isConnectionLost = true;
  }
};

// Define the handler
private handleReconnectUnauthorized = () => {
  console.warn("Unauthorized reconnect attempt detected.");

  // Optionally, show a specific toast or directly handle logout
  toast.error(t("webSocketService.unauthorized"), {
    duration: 3000,
  });

  // Trigger token refresh or logout
  this.handleTokenExpiry();
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

    // Flush queued chat updates
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
    console.log("Handling new message for chatId:", chatId);

    const state = store.getState();
    const chatExists = state.chats.chats[chatId];
    const currentChatId = state.chats.currentChat?._id;
    const currentUserId = state.auth.userId;

    if (!chatExists) {
      console.log(
        `Chat with ID ${chatId} does not exist. Fetching chat from server.`
      );
      try {
        const chat = await fetchChatById(chatId);
        console.log("Fetched chat:", chat);
        store.dispatch(addChatReducer({ chat }));
      } catch (error) {
        console.error("Failed to fetch and add chat:", error);
        return;
      }
    } else {
      console.log(`Chat with ID ${chatId} already exists.`);
    }

    const firstTimeout = setTimeout(() => {
      console.log("Dispatching addMessageReducer for message:", message);
      store.dispatch(addMessageReducer({ chatId, message, fromServer: true }));

      if (message.sender !== currentUserId) {
        console.log("Message is from another user. Handling new notification.");
        handleNewNotification(message.sender, message.content, state);
      }

      const secondTimeout = setTimeout(() => {
        if (
          currentChatId === chatId &&
          message.sender !== currentUserId &&
          !message.readBy.includes(currentUserId)
        ) {
          console.log("Updating read status for message:", message);
          store.dispatch(
            updateReadStatusReducer({
              chatId,
              userId: currentUserId,
              messageIds: [message.local_id || message._id],
            })
          );
        }
      }, 50);
      this.timeoutIds.push(secondTimeout);
    }, 50);
    this.timeoutIds.push(firstTimeout);
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
    // console.log(`Emitting new message to chat ${chatId}:`, message);

    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing outgoing message.");
      this.enqueue(this.offlineMessageQueue, { chatId, message });

      return;
    }

    // console.log("Sending message to server via WebSocket.");
    this.socket.emit(
      "chat:message",
      { chatId, message },
      (ack: { success: boolean }) => {
        // console.log(`Server acknowledged message with success=${ack.success}`);
        if (!ack.success) {
          console.warn("Message delivery failed. Queuing message.");
          this.enqueue(this.offlineMessageQueue, { chatId, message });
        }
      }
    );

    const ackTimeout = setTimeout(() => {
      const isMessagePending = this.offlineMessageQueue.find(
        (msg) => msg.message.local_id === message.local_id
      );
      if (isMessagePending) {
        console.warn("Message acknowledgment timeout. Marking as failed.");
        // console.log("Dispatching uploadFailed reducer due to timeout.");
      }
    }, 5000);
    this.timeoutIds.push(ackTimeout);
  }

  // Emit a message read event to the server
  public emitMessageRead(chatId: string, messageIds: string[]) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing read status update.");
      this.enqueue(this.offlineReadStatusQueue, { chatId, messageIds });
      return;
    }

    this.socket.emit("chat:read", { chatId, messageIds });
  }

  // Emit a new chat creation event to the server
  public emitNewChat(chat: IChat) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing outgoing chat creation.");
      this.enqueue(this.offlineChatQueue, { chat });
      return;
    }

    this.socket.emit("chat:create", { chat });
  }

  // Emit a chat update event to the server
  public emitUpdateChat(chatId: string, updatedData: Partial<IChat>) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing outgoing chat update.");
      this.enqueue(this.offlineUpdateChatQueue, { chatId, updatedData });
      return;
    }

    this.socket.emit("chat:edit", { chatId, updatedData });
  }

  public emitAutomatedMessage(targetIds: string[], message: Partial<IMessage>) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing automated message.");
      this.enqueue(this.offlineAutomatedMessageQueue, { targetIds, message });
      return;
    }

    this.socket.emit("chat:automatedMessage", { targetIds, message });
  }

  // Clean up and disconnect
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.listenersSetUp = false;

      // Clear all pending timeouts
      this.timeoutIds.forEach((id) => clearTimeout(id));
      this.timeoutIds = [];

      // Dismiss all persistent toasts
      toast.dismiss(this.connectionLostToastId);
      toast.dismiss("reconnectedToast");
    }

    // Remove visibility change listener
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  }
}

export const webSocketService = new WebSocketService();
