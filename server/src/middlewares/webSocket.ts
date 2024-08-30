import cookie from "cookie";
import { Socket, Server as SocketIOServer } from "socket.io";
import { IAlert } from "../models/Alert";
import { User } from "../models/User";
import { logger } from "../utils/logger";
import { getSessionByToken } from "../utils/sessionUtils";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  entityCode?: string;
  authType?: "email" | "google";
}

export const setupWebSocket = (io: SocketIOServer) => {
  const connectedClients = new Map<string, Set<AuthenticatedSocket>>();

  io.use(async (socket: AuthenticatedSocket, next) => {
    const sessionToken =
      socket.handshake.auth.sessionToken ||
      socket.handshake.headers.authorization?.replace("Bearer ", "") ||
      parseCookie(socket.handshake.headers.cookie || "")["sessionToken"];

    if (!sessionToken) {
      const error = new Error(
        "Authentication error: No session token provided"
      );
      logger.warn(error.message, { socketId: socket.id });
      return next(error);
    }

    try {
      const session = await getSessionByToken(sessionToken);
      if (!session) {
        const error = new Error("Invalid or expired session");
        logger.warn(
          `Authentication error: ${error.message} for token: ${sessionToken}`,
          { socketId: socket.id }
        );
        return next(error);
      }
      await authenticateSocket(socket, session.userId.toString());
      logger.info(`Socket authenticated`, {
        userId: session.userId,
        socketId: socket.id,
      });
      next();
    } catch (error) {
      logger.error("Authentication error", { error, socketId: socket.id });
      return next(new Error("Authentication error: Invalid session"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    logger.info("Client connected", {
      userId: socket.userId,
      socketId: socket.id,
    });

    if (socket.userId && socket.userRole && socket.entityCode) {
      if (!connectedClients.has(socket.userId)) {
        connectedClients.set(socket.userId, new Set());
      }
      connectedClients.get(socket.userId)!.add(socket);
    }

    socket.on("disconnect", () => {
      logger.info("Client disconnected", {
        userId: socket.userId,
        socketId: socket.id,
      });
      if (socket.userId) {
        const sockets = connectedClients.get(socket.userId);
        if (sockets) {
          sockets.delete(socket);
          if (sockets.size === 0) {
            connectedClients.delete(socket.userId);
            logger.info("All sockets disconnected for user", {
              userId: socket.userId,
            });
          }
        }
      }
    });

    socket.on("logout", () => {
      logger.info("Client logout requested", {
        userId: socket.userId,
        socketId: socket.id,
      });

      socket.disconnect(true);
    });
  });

  io.on("connect_error", (error) => {
    logger.error("WebSocket connection error", { error });
  });

  const emitAlert = (alert: IAlert) => {
    connectedClients.forEach((sockets, userId) => {
      sockets.forEach((socket) => {
        if (
          socket.userRole === "admin" ||
          socket.userRole === "agent" ||
          (socket.userRole === alert.entityRole &&
            socket.entityCode === alert.entityCode)
        ) {
          logger.debug("Emitting alert", {
            alertId: alert.id,
            userId,
            socketId: socket.id,
          });

          socket.emit("alerts:update", alert);
        }
      });
    });
  };

  return { emitAlert };
};

// Authenticate the socket based on the session token
async function authenticateSocket(socket: AuthenticatedSocket, userId: string) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      logger.error(error.message, { userId, socketId: socket.id });
      throw error;
    }

    socket.userId = user.id.toString();
    socket.userRole = user.role;
    socket.entityCode = user.entityCode;
    socket.authType = user.authType;
    logger.info("Socket authenticated successfully", {
      userId: socket.userId,
      socketId: socket.id,
    });
  } catch (error) {
    logger.error("Error during socket authentication", {
      error,
      userId,
      socketId: socket.id,
    });
    throw error;
  }
}

function parseCookie(cookieString: string) {
  return cookie.parse(cookieString);
}
