import { io, Socket } from "socket.io-client";
import { store } from "../store";
import { updateAlert } from "./dataSlice";

class WebSocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(process.env.REACT_APP_API_URL!, {
      withCredentials: true, // This allows the cookie to be sent
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("alert_update", (alert) => {
      store.dispatch(updateAlert(alert));
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    // Respond to heartbeat
    this.socket.on("heartbeat", () => {
      this.socket?.emit("heartbeat");
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const webSocketService = new WebSocketService();
