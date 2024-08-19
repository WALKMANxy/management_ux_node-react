import jwt from "jsonwebtoken";
import { Socket, Server as SocketIOServer } from "socket.io";
import { IAlert } from "../models/Alert";
import { User } from "../models/User";
import { DecodedToken } from "../models/types";
import {
  generateAccessToken,
  generateRefreshToken,
  isTokenBlacklisted,
  verifyToken,
} from "../utils/tokenUtils";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  entityCode?: string;
  authType?: "email" | "google";
}

export const setupWebSocket = (io: SocketIOServer) => {
  const connectedClients = new Map<string, AuthenticatedSocket>();

  io.use(async (socket: AuthenticatedSocket, next) => {
    const accessToken =
      socket.handshake.auth.accessToken ||
      socket.handshake.headers.authorization?.replace("Bearer ", "") ||
      parseCookie(socket.handshake.headers.cookie || "")["accessToken"];
    const refreshToken =
      socket.handshake.auth.refreshToken ||
      parseCookie(socket.handshake.headers.cookie || "")["refreshToken"];

    if (!accessToken) {
      return next(new Error("Authentication error: No access token provided"));
    }

    try {
      const decoded = verifyToken(accessToken);
      if (await isTokenBlacklisted(accessToken)) {
        throw new Error("Token has been blacklisted");
      }
      await authenticateSocket(socket, decoded);
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError && refreshToken) {
        try {
          const decoded = verifyToken(refreshToken);
          const user = await User.findById(decoded.id);

          if (
            !user ||
            !user.refreshTokens.includes(refreshToken) ||
            (await isTokenBlacklisted(refreshToken))
          ) {
            throw new Error("Invalid refresh token");
          }

          user.refreshTokens = user.refreshTokens.filter(
            (token) => token !== refreshToken
          );
          const newAccessToken = generateAccessToken(user);
          const newRefreshToken = generateRefreshToken(user);
          await user.save();

          socket.emit("token_refreshed", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
          await authenticateSocket(socket, verifyToken(newAccessToken));
          next();
        } catch (refreshError) {
          return next(new Error("Authentication error: Invalid refresh token"));
        }
      } else {
        return next(new Error("Authentication error: Invalid token"));
      }
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.userId}`);

    if (socket.userId && socket.userRole && socket.entityCode) {
      connectedClients.set(socket.userId, socket);
    }

    let heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat");
    }, 30000);

    socket.on("heartbeat", () => {
      // Client is still alive
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.userId}`);
      if (socket.userId) {
        connectedClients.delete(socket.userId);
      }
      clearInterval(heartbeatInterval);
    });

    socket.on("logout", () => {
      socket.disconnect(true);
    });
  });

  io.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error);
  });

  const emitAlert = (alert: IAlert) => {
    connectedClients.forEach((socket) => {
      if (
        socket.userRole === "admin" ||
        socket.userRole === "agent" ||
        (socket.userRole === alert.entityRole &&
          socket.entityCode === alert.entityCode)
      ) {
        socket.emit("alert_update", alert);
      }
    });
  };

  return { emitAlert };
};

async function authenticateSocket(
  socket: AuthenticatedSocket,
  decoded: DecodedToken
) {
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new Error("User not found");
  }

  socket.userId = user.id.toString();
  socket.userRole = user.role;
  socket.entityCode = user.entityCode;
  socket.authType = decoded.authType;
}

// Helper function to parse cookies
function parseCookie(cookie: string) {
  return cookie.split(";").reduce((acc, pair) => {
    const [key, value] = pair.trim().split("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
}
