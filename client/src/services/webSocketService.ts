import { io, Socket } from "socket.io-client";
import { AppStore } from "../app/store";
import { getApiUrl } from "../config/config";
import { addAlert, updateAlert } from "../features/data/dataSlice"; // Assuming dataSlice is in features/data
import { Alert } from "../models/dataModels";

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
    this.socket.on("alerts:update", this.handleAlertUpdate);
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

  private handleAlertUpdate = (alert: Alert) => {
    // Check if the store has been injected before using it
    if (!store) {
      console.error("Store has not been injected into WebSocketService.");
      return;
    }

    const state = store.getState().data;
    const existingAlert = state.currentUserAlerts?.find(
      (a) => a._id === alert._id
    );

    if (existingAlert) {
      store.dispatch(updateAlert(alert)); // Update the existing alert
    } else {
      store.dispatch(addAlert(alert)); // Add the new alert
    }
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
      this.socket.off("alerts:update", this.handleAlertUpdate);
      this.socket.off("connect_error", this.handleConnectError);
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService();
