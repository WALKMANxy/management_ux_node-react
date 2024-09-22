import cookie from "cookie";
import mongoose from "mongoose";
import { Socket, Server as SocketIOServer } from "socket.io";
import { IChat, IMessage } from "../models/Chat";
import { User } from "../models/User";
import { ChatService } from "../services/chatService";
import { logger } from "../utils/logger";
import { getSessionByToken } from "../utils/sessionUtils";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  entityCode?: string;
  authType?: "email" | "google";
}

const connectedClients = new Map<string, Set<AuthenticatedSocket>>();


export const setupWebSocket = (io: SocketIOServer) => {

  io.use(async (socket: AuthenticatedSocket, next) => {
    const cookies = parseCookie(socket.handshake.headers.cookie || "");
    const sessionToken = cookies["sessionToken"];

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

      const userId = session.userId.toString();
      await authenticateSocket(socket, userId);
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

    if (socket.userId) {
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



    // Handle incoming message with client-generated local_id and server-generated _id
    socket.on(
      "chat:message",
      async ({
        chatId,
        message,
      }: {
        chatId: string;
        message: Partial<IMessage>;
      }) => {
        try {
          // Add the message using the service, which handles validation and updates
          const updatedChat = await ChatService.addMessage(chatId, message);

          if (!updatedChat) {
            logger.error("Chat not found or message could not be added", {
              chatId,
            });
            return;
          }

          // Emit the new message to all connected participants
          updatedChat.participants.forEach((participantId) => {
            const sockets = connectedClients.get(participantId.toString());
            if (sockets) {
              sockets.forEach((clientSocket) => {
                clientSocket.emit("chat:newMessage", {
                  chatId,
                  message:
                    updatedChat.messages[updatedChat.messages.length - 1], // Send the latest message
                });
              });
            }
          });
        } catch (error) {
          logger.error("Error handling new message", { error });
        }
      }
    );
    // Handle new chat creation with local_id from client and _id from server
    socket.on("chat:create", async ({ chat }: { chat: Partial<IChat> }) => {
      try {
        // Use the createChat service method to handle chat creation
        const createdChat = await ChatService.createChat(chat);

        // Emit the chat (either existing or newly created) to all participants
        createdChat.participants.forEach((participantId) => {
          const sockets = connectedClients.get(participantId.toString());
          if (sockets) {
            sockets.forEach((clientSocket) => {
              clientSocket.emit("chat:newChat", {
                chat: createdChat, // Send the chat object with the correct server-assigned _id
              });
            });
          }
        });
      } catch (error) {
        logger.error("Error handling new chat creation", { error });
      }
    });

    // Update read status for multiple messages within a chat
    socket.on(
      "chat:read",
      async ({
        chatId,
        messageIds,
      }: {
        chatId: string;
        messageIds: string[];
      }) => {
        // Ensure userId exists and convert it to ObjectId
        if (!socket.userId) {
          logger.warn("User ID is missing in the chat:read event", {
            socketId: socket.id,
          });
          return;
        }

        const userObjectId = new mongoose.Types.ObjectId(socket.userId);

        try {
          // Use the service to update the read status of the specified messages
          const updatedChat = await ChatService.updateReadStatus(
            chatId,
            messageIds,
            userObjectId.toString()
          );

          if (!updatedChat) {
            logger.error("Chat not found or no messages to update", { chatId });
            return;
          }

          // Emit the read status update to all participants
          updatedChat.participants.forEach((participantId) => {
            const sockets = connectedClients.get(participantId.toString());
            if (sockets) {
              sockets.forEach((clientSocket) => {
                clientSocket.emit("chat:messageRead", {
                  chatId,
                  userId: socket.userId,
                  messageIds, // Send back the read message IDs
                });
              });
            }
          });
        } catch (error) {
          logger.error("Error updating read status", { error });
        }
      }
    );

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

  return { connectedClients };
};

// Function to emit events only to admins
export function emitToAdmins(event: string, data: any) {
  connectedClients.forEach((sockets) => {
    sockets.forEach((clientSocket) => {
      if (clientSocket.userRole === "admin") {
        clientSocket.emit(event, data);
      }
    });
  });
}

// Function to emit events only to a specific user
export function emitToUser(userId: string, event: string, data: any) {
  const sockets = connectedClients.get(userId);
  if (sockets) {
    sockets.forEach((clientSocket) => {
      clientSocket.emit(event, data);
    });
  }
}

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
