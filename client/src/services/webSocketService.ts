import { io, Socket } from "socket.io-client";
import { AppStore } from "../app/store";
import { getApiUrl } from "../config/config";
import {
  addMessageReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice";
import { IMessage } from "../models/dataModels";

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
  private offlineReadStatusQueue: Array<{ chatId: string }> = [];
  private offlineMessageQueue: Array<{ chatId: string; message: IMessage }> =
    [];

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
  }

  // On connect, flush the offline queues
  private handleConnect = () => {
    console.log("WebSocket connected");
    this.reconnectAttempts = 0;

    // Flush read status updates
    while (this.offlineReadStatusQueue.length > 0) {
      const { chatId } = this.offlineReadStatusQueue.shift()!;
      this.emitMessageRead(chatId);
    }

    // Flush queued messages
    while (this.offlineMessageQueue.length > 0) {
      const { chatId, message } = this.offlineMessageQueue.shift()!;
      this.emitNewMessage(chatId, message);
    }
  };

  private handleDisconnect = (reason: Socket.DisconnectReason) => {
    console.log(`WebSocket disconnected: ${reason}`);
    this.tryReconnect();
  };

  private handleConnectError = (error: Error) => {
    console.error("WebSocket connection error:", error);
    this.tryReconnect();
  };

  private tryReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.socket?.connect(), 5000 * this.reconnectAttempts);
    } else {
      console.error(
        "Max reconnection attempts reached. Please refresh the page."
      );
    }
  }

  // Handle incoming new message event
  public handleNewMessage = ({
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

    // Dispatch the action to update local state
    store.dispatch(addMessageReducer({ chatId, message }));
  };

  // Handle incoming message read event
  public handleMessageRead = ({
    chatId,
    userId,
  }: {
    chatId: string;
    userId: string;
  }) => {
    if (!store) {
      console.error("Store has not been injected into WebSocketService.");
      return;
    }

    // Dispatch the action to update the read status in local state
    store.dispatch(updateReadStatusReducer({ chatId, userId }));
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
  public emitMessageRead(chatId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn("Socket disconnected. Queuing read status update.");
      this.offlineReadStatusQueue.push({ chatId });
      return;
    }

    this.socket.emit("chat:read", { chatId });
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
