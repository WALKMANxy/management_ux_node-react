import { io, Socket } from "socket.io-client";
import { AppStore } from "../app/store";
import { getApiUrl } from "../config/config";
import { addMessage, updateReadStatus } from "../features/chat/chatSlice";
import { IMessage } from "../models/dataModels";

// Define a variable to hold the store reference
let store: AppStore;

const apiUrl = getApiUrl();

if (!apiUrl) {
  console.error("Api URL is not defined inside webSocket.ts.");
}

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

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

    this.socket.on("connect", this.handleConnect);
    this.socket.on("disconnect", this.handleDisconnect);
    this.socket.on("chat:newMessage", this.handleNewMessage);
    this.socket.on("chat:messageRead", this.handleMessageRead);
    this.socket.on("connect_error", this.handleConnectError);
  }

  private handleConnect = () => {
    console.log("WebSocket connected");
    this.reconnectAttempts = 0;
  };

  private handleDisconnect = (reason: Socket.DisconnectReason) => {
    console.log(`WebSocket disconnected: ${reason}`);
    this.tryReconnect();
  };

  public handleNewMessage = ({
    chatId,
    message,
  }: {
    chatId: string;
    message: IMessage;
  }) => {
    // Check if the store has been injected before using it
    if (!store) {
      console.error("Store has not been injected into WebSocketService.");
      return;
    }

    store.dispatch(addMessage({ chatId, message }));

    // Optionally, you might want to fetch recent messages or perform additional checks
    // store.dispatch(fetchMessages({ chatId }));
  };

  public handleMessageRead = ({
    chatId,
    messageId,
    userId,
  }: {
    chatId: string;
    messageId: string;
    userId: string;
  }) => {
    // Update the read status of the message in the chat slice
    if (!store) {
      console.error("Store has not been injected into WebSocketService.");
      return;
    }

    store.dispatch(updateReadStatus({ chatId, messageId, userId }));
  };

  private handleConnectError = (error: Error) => {
    console.error("WebSocket connection error:", error);
    this.tryReconnect();
  };

  tryReconnect() {
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
  // New public methods to add event listeners safely
  onNewMessage(listener: (data: { chatId: string; message: IMessage }) => void) {
    this.socket?.on("chat:newMessage", listener);
  }
  onMessageRead(
    listener: (data: {
      chatId: string;
      messageId: string;
      userId: string;
    }) => void
  ) {
    this.socket?.on("chat:messageRead", listener);
  }
}

export const webSocketService = new WebSocketService();
