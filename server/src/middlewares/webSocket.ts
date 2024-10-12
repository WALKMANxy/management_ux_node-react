import { Socket, Server as SocketIOServer } from "socket.io";
import { config } from "../config/config";
import { IChat, IMessage } from "../models/Chat";
import { User } from "../models/User";
import { ChatService } from "../services/chatService";
import { logger } from "../utils/logger";
import { getSessionByAccessToken } from "../utils/sessionUtils";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  entityCode?: string;
  authType?: "email" | "google";
}

export const setupWebSocket = (io: SocketIOServer) => {
  // Middleware to authenticate the WebSocket connection
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Extract access token from socket handshake headers (e.g., Authorization: Bearer <token>)
      const accessToken = socket.handshake.auth.authorization?.replace(
        "Bearer ",
        ""
      );

      if (!accessToken) {
        logger.warn("No access token provided for WebSocket connection", {
          socketId: socket.id,
        });
        return next(
          new Error("Authentication error: No access token provided")
        );
      }

      // Retrieve the user-agent from the socket handshake
      const userAgent = socket.handshake.headers["user-agent"] || "Unknown";

      // Use the same logic from `authenticateUser` middleware
      const session = await getSessionByAccessToken(accessToken, {
        get: () => userAgent,
      } as any);

      if (!session) {
        logger.warn("Invalid or expired session for WebSocket connection", {
          socketId: socket.id,
        });
        socket.emit("reconnect:unauthorized"); // Notify client of unauthorized connection due to expired token
        return next(
          new Error("Authentication error: Invalid or expired session")
        );
      }
      // Retrieve the user associated with the session
      const user = await User.findById(session.userId);

      if (!user) {
        logger.warn(
          "User not found for session during WebSocket authentication",
          { sessionId: session._id }
        );
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user info to the socket for future use
      socket.userId = user.id;
      socket.userRole = user.role;
      socket.entityCode = user.entityCode;
      socket.authType = user.authType;

      logger.info("Socket authenticated successfully", {
        userId: socket.userId,
        socketId: socket.id,
      });
      next(); // Proceed with the connection
    } catch (error) {
      logger.error("WebSocket authentication error", {
        error,
        socketId: socket.id,
      });
      return next(new Error("Authentication error"));
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

      await joinUserToChats(io, socket);

      // We're gonna handle this once the project starts, since there are no users currently.
     /*  // Join all existing chat rooms the user is part of
      // Check if user is employee or admin and update the broadcast chat accordingly
      const broadcastChatId = "6701f7dbc1a80a3d029808ab";

      if (socket.userRole === "employee") {
        // Add the employee to the broadcast chat's participants
        await ChatService.addParticipantToChat(broadcastChatId, socket.userId);
      } else if (socket.userRole === "admin") {
        // Add the admin to the broadcast chat's admin list
        await ChatService.addAdminToChat(broadcastChatId, socket.userId);

        socket.join("admins"); // Also join the 'admins' room
      } */
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

    // **Handle chat editing**
    socket.on("chat:edit", async ({ chatId, updatedData }) => {
      try {
        const updatedChat = await ChatService.updateChat(chatId, updatedData);

        if (!updatedChat) {
          throw new Error("Chat not found");
        }

        // Emit 'chat:updatedChat' to inform all participants about the updated chat
        updatedChat.participants.forEach((participantId) => {
          const participantRoomId = `user:${participantId.toString()}`;
          io.to(participantRoomId).emit("chat:updatedChat", {
            chat: updatedChat,
          });
        });

        logger.info("Chat updated successfully.", {
          chatId: updatedChat._id,
          updatedData: updatedData,
        });
      } catch (error) {
        logger.error("Error handling chat editing", { error });
        // Emit an error back to the client
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
