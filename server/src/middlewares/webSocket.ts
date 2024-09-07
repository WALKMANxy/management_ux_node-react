import cookie from "cookie";
import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import { Socket, Server as SocketIOServer } from "socket.io";
import { Chat, IMessage } from "../models/Chat";
import { User } from "../models/User";
import { messageSchema } from "../utils/joiUtils";
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

    socket.on(
      "chat:message",
      async ({
        chatId,
        message,
      }: {
        chatId: string;
        message: Partial<IMessage>;
      }) => {
        // Validate chatId and message data
        const { error, value } = messageSchema.validate({ chatId, message });
        if (error) {
          logger.warn("Validation error on chat:message", {
            error: error.message,
          });
          return;
        }

        // Sanitize the message content to prevent XSS attacks
        value.message.content = sanitizeHtml(value.message.content, {
          allowedTags: [],
          allowedAttributes: {},
        });

        try {
          // Generate a unique ID before saving the message
          const newMessageId = new mongoose.Types.ObjectId().toString(); // Generate unique MongoDB ID

          // Update message to include server-side modifications
          const messageToSave = {
            ...message,
            _id: newMessageId,
            status: "sent",
          };

          const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
              $push: { messages: messageToSave },
              $set: { updatedAt: new Date() },
            },
            { new: true }
          );

          if (!updatedChat) {
            logger.error("Chat not found", { chatId });
            return;
          }

          // Emit the new message to all connected participants
          updatedChat.participants.forEach((participantId) => {
            const sockets = connectedClients.get(participantId.toString());
            if (sockets) {
              sockets.forEach((clientSocket) => {
                clientSocket.emit("chat:newMessage", {
                  chatId,
                  message: messageToSave,
                });
              });
            }
          });
        } catch (error) {
          logger.error("Error handling new message", { error });
        }
      }
    );

    socket.on("chat:read", async ({ chatId }: { chatId: string }) => {
      try {
        // Update all unread messages in the chat for the current user
        const chat = await Chat.updateMany(
          { _id: chatId, "messages.readBy": { $ne: socket.userId } },
          { $addToSet: { "messages.$.readBy": socket.userId } },
          { new: true }
        );

        if (!chat) {
          logger.error("Chat not found or no messages to update", { chatId });
          return;
        }

        // Emit read receipt update to all participants
        const updatedChat = await Chat.findById(chatId); // Retrieve updated chat data
        updatedChat?.participants.forEach((participantId) => {
          const sockets = connectedClients.get(participantId.toString());
          if (sockets) {
            sockets.forEach((clientSocket) => {
              clientSocket.emit("chat:messageRead", {
                chatId,
                userId: socket.userId,
              });
            });
          }
        });
      } catch (error) {
        logger.error("Error updating read status", { error });
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

  return { connectedClients };
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
