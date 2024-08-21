import cookie from "cookie";
import { Socket, Server as SocketIOServer } from "socket.io";
import { IAlert } from "../models/Alert";
import { User } from "../models/User";
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
      const error = new Error("Authentication error: No session token provided");
      console.error(error.message);
      return next(error);
    }

    try {
      const session = await getSessionByToken(sessionToken);
      if (!session) {
        const error = new Error("Invalid or expired session");
        console.error(`Authentication error: ${error.message} for token: ${sessionToken}`);
        return next(error);
      }
      await authenticateSocket(socket, session.userId.toString());
      console.log(`Socket authenticated: User ID ${session.userId}`);
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return next(new Error("Authentication error: Invalid session"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.userId}`);

    if (socket.userId && socket.userRole && socket.entityCode) {
      if (!connectedClients.has(socket.userId)) {
        connectedClients.set(socket.userId, new Set());
      }
      connectedClients.get(socket.userId)!.add(socket);
    }

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.userId}`);
      if (socket.userId) {
        const sockets = connectedClients.get(socket.userId);
        if (sockets) {
          sockets.delete(socket);
          if (sockets.size === 0) {
            connectedClients.delete(socket.userId);
          }
        }
      }
    });

    socket.on("logout", () => {
      socket.disconnect(true);
    });
  });

  io.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error);
  });

  const emitAlert = (alert: IAlert) => {
    connectedClients.forEach((sockets) => {
      sockets.forEach((socket) => {
        if (
          socket.userRole === "admin" ||
          socket.userRole === "agent" ||
          (socket.userRole === alert.entityRole &&
            socket.entityCode === alert.entityCode)
        ) {
          socket.emit("alerts:update", alert);
        }
      });
    });
  };

  return { emitAlert };
};

async function authenticateSocket(socket: AuthenticatedSocket, userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  socket.userId = user.id.toString();
  socket.userRole = user.role;
  socket.entityCode = user.entityCode;
  socket.authType = user.authType;
}

function parseCookie(cookieString: string) {
  return cookie.parse(cookieString);
}