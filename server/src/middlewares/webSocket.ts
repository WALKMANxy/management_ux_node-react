import cookie from "cookie";
import { Socket, Server as SocketIOServer } from "socket.io";
import { config } from "../config/config";
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

  io.on("connection", async (socket: AuthenticatedSocket) => {
    logger.info("Client connected", {
      userId: socket.userId,
      socketId: socket.id,
    });

    if (socket.userId) {
      // Join the user-specific room
      const userRoomId = `user:${socket.userId}`;
      socket.join(userRoomId);
      logger.debug(`Socket ${socket.id} joined user room ${userRoomId}`);

      // Join all existing chat rooms the user is part of
      await joinUserToChats(io, socket);
      // If the user is an admin, join the 'admins' room
      if (socket.userRole === "admin") {
        socket.join("admins");
        logger.debug(`Socket ${socket.id} joined admins room`);
      }
    }

    socket.on("disconnect", () => {
      logger.info("Client disconnected", {
        userId: socket.userId,
        socketId: socket.id,
      });
      // Socket.IO automatically handles leaving all rooms upon disconnection
    });

    // Handle incoming message
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
          const updatedChat = await ChatService.addMessage(chatId, message);

          if (!updatedChat) {
            logger.error("Chat not found or message could not be added", {
              chatId,
            });
            return;
          }

          const roomId = `chat:${chatId}`;
          io.to(roomId).emit("chat:newMessage", {
            chatId,
            message: updatedChat.messages[updatedChat.messages.length - 1],
          });
        } catch (error) {
          logger.error("Error handling new message", { error });
        }
      }
    );

    // Handle chat creation
    socket.on("chat:create", async ({ chat }: { chat: Partial<IChat> }) => {
      try {
        const createdChat = await ChatService.createChat(chat);

        // Automatically join all participants to the correct chat room
        createdChat.participants.forEach((participantId) => {
          const roomId = `chat:${createdChat._id}`;
          const participantSocket = io.sockets.sockets.get(
            participantId.toString()
          );
          if (participantSocket) {
            participantSocket.join(roomId);
            logger.info("User automatically joined chat room", {
              userId: participantId.toString(),
              chatId: createdChat._id,
              roomId,
            });
          }
        });

        // Emit 'chat:newChat' to inform the clients about the new chat
        createdChat.participants.forEach((participantId) => {
          const participantRoomId = `user:${participantId.toString()}`;
          io.to(participantRoomId).emit("chat:newChat", {
            chat: createdChat,
          });
        });

        logger.info("New chat created and users joined successfully.", {
          chatId: createdChat._id,
          participants: createdChat.participants,
        });
      } catch (error) {
        logger.error("Error handling new chat creation", { error });
      }
    });

    // Handle read status updates
    socket.on(
      "chat:read",
      async ({
        chatId,
        messageIds,
      }: {
        chatId: string;
        messageIds: string[];
      }) => {
        if (!socket.userId) {
          logger.warn("User ID is missing in the chat:read event", {
            socketId: socket.id,
          });
          return;
        }

        try {
          const updatedChat = await ChatService.updateReadStatus(
            chatId,
            messageIds,
            socket.userId
          );

          if (!updatedChat) {
            logger.error("Chat not found or no messages to update", { chatId });
            return;
          }

          const roomId = `chat:${chatId}`;
          io.to(roomId).emit("chat:messageRead", {
            chatId,
            userId: socket.userId,
            messageIds,
          });
        } catch (error) {
          logger.error("Error updating read status", { error });
        }
      }
    );

    // Handle automated messages
    socket.on(
      "chat:automatedMessage",
      async ({
        targetIds,
        message,
      }: {
        targetIds: string[];
        message: Partial<IMessage>;
      }) => {
        try {
          const botId = config.botId;

          const chatIds = await ChatService.sendAutomatedMessageToUsers(
            targetIds,
            message,
            botId,
            io // Pass io instance
          );

          if (chatIds.length === 0) {
            logger.warn("No chats found or created for automated messages.");
            return;
          }

          const chats = await ChatService.getChatsByIdsArray(chatIds, botId);

          chats.forEach((chat) => {
            const roomId = `chat:${chat._id}`;
            const latestMessage = chat.messages[chat.messages.length - 1];
            if (latestMessage) {
              io.to(roomId).emit("chat:newMessage", {
                chatId: chat._id,
                message: latestMessage,
              });
            }
          });

          logger.info("Automated messages emitted successfully.", {
            chatIds,
            targetIds,
            totalChats: chats.length,
          });
        } catch (error) {
          logger.error("Error handling automated message", { error });
        }
      }
    );

    // Handle logout
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
};

// Function to join all chat rooms the user is part of upon connection
async function joinUserToChats(
  io: SocketIOServer,
  socket: AuthenticatedSocket
) {
  if (socket.userId) {
    const chatIds = await ChatService.getAllChatIds(socket.userId);
    await Promise.all(
      chatIds.map(async (chatId) => {
        const roomId = `chat:${chatId}`;
        await socket.join(roomId);
      })
    );
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
