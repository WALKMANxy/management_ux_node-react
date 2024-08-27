import { io, Socket } from "socket.io-client";
import { Alert } from "../models/dataModels";
import store from "../app/store";
import { addAlert, updateAlert } from "../features/data/dataSlice"; // Assuming dataSlice is in features/data
import { Admin, Agent, Client } from "../models/entityModels";

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (!process.env.REACT_APP_API_URL) {
      console.error("REACT_APP_API_URL is not defined");
      return;
    }

    this.socket = io(process.env.REACT_APP_API_URL, {
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
    // Use findAlertById to check if the alert already exists in the state
    const existingAlert = this.findAlertById(alert._id);
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

  private tryReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.socket?.connect(), 5000 * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached. Please refresh the page.");
    }
  }

  // This function should now look inside currentUserData for the alerts
  private findAlertById(alertId: string): Alert | undefined {
    const state = store.getState().data;
    if (state.currentUserData) {
      if (state.currentUserDetails?.role === "client") {
        return (state.currentUserData as Client).clientAlerts.find(
          (alert) => alert._id === alertId
        );
      } else if (state.currentUserDetails?.role === "agent") {
        return (state.currentUserData as Agent).agentAlerts.find(
          (alert) => alert._id === alertId
        );
      } else if (state.currentUserDetails?.role === "admin") {
        return (state.currentUserData as Admin).adminAlerts.find(
          (alert) => alert._id === alertId
        );
      }
    }
    return undefined;
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
