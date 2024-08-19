import jwt from "jsonwebtoken";
import { Socket, Server as SocketIOServer } from "socket.io";
import { config } from "../config/config";
import { IAlert } from "../models/Alert";
import { User } from "../models/User";
import { DecodedToken } from "../models/types";

const JWT_SECRET = config.jwtSecret || "";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  entityCode?: string;
  authType?: "email" | "google";
}

export const setupWebSocket = (io: SocketIOServer) => {
  const connectedClients = new Map<string, AuthenticatedSocket>();

  io.use(async (socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "") ||
      parseCookie(socket.handshake.headers.cookie || "")["token"];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return next(new Error("Authentication error: Token has expired"));
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(
          new Error("Authentication error: Invalid token, user not found")
        );
      }

      socket.userId = user.id.toString();
      socket.userRole = user.role;
      socket.entityCode = user.entityCode;
      socket.authType = decoded.tokenType;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new Error("Authentication error: Token has expired"));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new Error("Authentication error: Invalid token"));
      }
      console.error("WebSocket authentication error:", error);
      return next(new Error("Internal server error during authentication"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.userId}`);

    if (socket.userId && socket.userRole && socket.entityCode) {
      connectedClients.set(socket.userId, socket);
    }

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.userId}`);
      if (socket.userId) {
        connectedClients.delete(socket.userId);
      }
    });
  });

  const emitAlert = (alert: IAlert) => {
    connectedClients.forEach((socket) => {
      if (
        socket.userRole === "admin" ||
        (socket.userRole === alert.entityRole &&
          socket.entityCode === alert.entityCode)
      ) {
        socket.emit("alert_update", alert);
      }
    });
  };

  return { emitAlert };
};

// Helper function to parse cookies
function parseCookie(cookie: string) {
  return cookie.split(";").reduce((acc, pair) => {
    const [key, value] = pair.trim().split("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
}
