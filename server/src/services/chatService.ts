// services/chatService.ts

import mongoose, { Types } from "mongoose";
import { Chat, IChat, IMessage } from "../models/Chat";
import { logger } from "../utils/logger";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

// Custom Error Classes (Optional but Recommended)
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class DuplicateChatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateChatError";
  }
}

// Utility function to check if a string is a valid ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// Refactored findExistingChat function
async function findExistingChat(
  chatData: Partial<IChat>
): Promise<IChat | null> {
  if (chatData.type === "simple" && chatData.participants) {
    const sortedParticipants = chatData.participants
      .map((p) => p.toString())
      .sort();
    return Chat.findOne({
      type: "simple",
      participants: {
        $all: sortedParticipants,
        $size: sortedParticipants.length,
      },
    });
  }

  if (["group", "broadcast"].includes(chatData.type!)) {
    // Only query by _id if it's a valid ObjectId
    if (chatData._id && isValidObjectId(chatData._id.toString())) {
      const chatById = await Chat.findOne({
        type: chatData.type,
        _id: chatData._id,
      });
      if (chatById) return chatById;
    }

    // Query by local_id
    if (chatData.local_id) {
      const chatByLocalId = await Chat.findOne({
        type: chatData.type,
        local_id: chatData.local_id,
      });
      if (chatByLocalId) return chatByLocalId;
    }

    // Additional uniqueness checks based on name or admin
    if (chatData.type === "group" && chatData.name) {
      const chatByName = await Chat.findOne({
        type: "group",
        name: chatData.name,
      });
      if (chatByName) return chatByName;
    }

    if (
      chatData.type === "broadcast" &&
      chatData.admins &&
      chatData.admins.length > 0
    ) {
      const chatByAdmin = await Chat.findOne({
        type: "broadcast",
        admins: { $in: chatData.admins },
      });
      if (chatByAdmin) return chatByAdmin;
    }
  }

  return null;
}

export class ChatService {
  // Fetch all chats for a user with the latest message preview
  static async getAllChats(userId: string): Promise<IChat[]> {
    try {
      const chats = await Chat.find({
        participants: userId,
      })
        .sort({ updatedAt: -1 }) // Sort by the most recently updated chats
        .select({ messages: { $slice: -25 } }) // Only fetch the latest message for preview
        .lean(); // Use lean for faster reads as we're not modifying the data

      return chats;
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw new Error("Failed to fetch chats");
    }
  }

  static async getAllChatIds(userId: string): Promise<Types.ObjectId[]> {
    try {
      const chatIds = await Chat.find({
        participants: userId,
      })
        .sort({ updatedAt: -1 }) // Sort by the most recently updated chats
        .select({ _id: 1 }) // Only select the _id field
        .lean() // Use lean for faster reads as we're not modifying the data
        .exec(); // Execute the query

      return chatIds.map(chat => chat._id);
    } catch (error) {
      console.error("Error fetching chat IDs:", error);
      throw new Error("Failed to fetch chat IDs");
    }
  }


  // Fetch a specific chat by its ID for the authenticated user
  static async getChatById(
    chatId: string,
    userId: string
  ): Promise<IChat | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error("Invalid chat ID format.");
      }

      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId, // Ensure the user is a participant
      }).lean();

      return chat;
    } catch (error) {
      console.error("Error fetching chat by ID:", error);
      throw new Error("Failed to fetch chat by ID");
    }
  }
  static async getChatsByIdsArray(
    chatIds: string[],
    userId: string
  ): Promise<IChat[]> {
    try {
      // Validate and convert chatIds to ObjectId
      const validChatIds = chatIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );
      const objectChatIds = validChatIds.map((id) => new Types.ObjectId(id));

      const chats = await Chat.find({
        _id: { $in: objectChatIds },
        participants: userId, // Ensure the user is a participant
      }).lean();

      return chats;
    } catch (error) {
      logger.error("Error fetching chats by IDs array:", { error });
      throw new Error("Failed to fetch chats by IDs array");
    }
  }

  // Fetch messages for a specific chat with pagination
  static async getMessages(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 100
  ): Promise<IMessage[]> {
    try {
      // Validate chatId and pagination parameters
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error("Invalid chat ID format.");
      }
      if (page < 1 || limit < 1) {
        throw new Error("Invalid pagination parameters.");
      }

      const skip = (page - 1) * limit;

      // Fetch the chat including participants and messages
      const chat = await Chat.findById(chatId, {
        participants: 1,
        messages: { $slice: [skip, limit] },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      // Validate and convert userId to ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format.");
      }
      const userObjectId = new Types.ObjectId(userId);

      // Check if the user is a participant in the chat
      if (
        !chat.participants.some((participant) =>
          participant.equals(userObjectId)
        )
      ) {
        throw new Error(
          "Access forbidden: You are not a participant in this chat."
        );
      }

      return chat.messages;
    } catch (error) {
      // Type guard to safely access error properties
      if (error instanceof Error) {
        console.error("Error fetching messages:", error.message);
        throw new Error(error.message || "Failed to fetch messages");
      } else {
        console.error("Unexpected error fetching messages:", error);
        throw new Error("Failed to fetch messages");
      }
    }
  }

  // Service: chatService.js

  // Fetch messages older than the provided timestamp
  static async getOlderMessages(
    chatId: string,
    userId: string,
    oldestTimestamp: string,
    limit: number // Include limit parameter
  ) {
    try {
     /*  console.log("Fetching older messages for:", {
        chatId,
        userId,
        oldestTimestamp,
        limit,
      }); */

      const chatObjectId = new Types.ObjectId(chatId);

      const oldestTimestampDate = new Date(oldestTimestamp);

      // Fetch the chat including messages older than the provided timestamp
      const chat = await Chat.findById(chatObjectId, {
        participants: 1,
        messages: 1,
      });

      if (!chat) {
        throw new Error("Chat not found or access denied.");
      }

/*       console.log("Chat found:", chat);
 */
      const userObjectId = new Types.ObjectId(userId);

      // Check if the user is a participant in the chat
      if (
        !chat.participants.some((participant) =>
          participant.equals(userObjectId)
        )
      ) {
        throw new Error(
          "Access forbidden: You are not a participant in this chat."
        );
      }

      // Use aggregation pipeline to fetch messages efficiently
      const olderMessages = await Chat.aggregate([
        { $match: { _id: chatObjectId } },
        { $unwind: "$messages" },
        { $match: { "messages.timestamp": { $lt: oldestTimestampDate } } },
        { $sort: { "messages.timestamp": -1 } }, // Sort messages in descending order by timestamp
        { $limit: limit }, // Limit to the next 25 messages older than the timestamp
        { $project: { messages: 1 } },
      ]).exec();

      // Extract messages from the aggregation result
      const messages = olderMessages.map((chat) => chat.messages);

/*       console.log("Fetched Older Messages:", messages);
 */
      return messages;
    } catch (error) {
      console.error("Error fetching older messages:", error);
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to fetch older messages");
      } else {
        throw new Error("Failed to fetch older messages");
      }
    }
  }

  // Fetch messages across multiple chats for the authenticated user
  static async getMessagesFromMultipleChats(
    chatIds: string[],
    userId: string
  ): Promise<{ chatId: string; messages: IMessage[] }[]> {
    try {
      // Validate chat IDs
      if (!chatIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Invalid chat ID format.");
      }

      // Fetch chats including participants and messages, only if user is a participant
      const chats = await Chat.find({
        _id: { $in: chatIds },
        participants: userId,
      })
        .select({ messages: 1, participants: 1 }) // Select only necessary fields
        .lean();

      // Validate and convert userId to ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format.");
      }
      const userObjectId = new Types.ObjectId(userId);

      // Prepare the result as an array of objects, each containing chatId and associated messages
      const result = chats.map((chat) => ({
        chatId: chat._id.toString(),
        messages: chat.participants.some((participant) =>
          participant.equals(userObjectId)
        )
          ? chat.messages
          : [],
      }));

      return result;
    } catch (error) {
      // Type guard to safely access error properties
      if (error instanceof Error) {
        console.error("Error fetching messages:", error.message);
        throw new Error(error.message || "Failed to fetch messages");
      } else {
        console.error("Unexpected error fetching messages:", error);
        throw new Error("Failed to fetch messages");
      }
    }
  }

  // Create a new chat (simple, group, or broadcast)

  // Revised createChat Function
  static async createChat(chatData: Partial<IChat>): Promise<IChat> {
    try {
      // **Validation Logic**
      if (!chatData.type) {
        throw new ValidationError("Chat type is required.");
      }

      if (
        chatData.type === "group" &&
        (!chatData.name ||
          !chatData.participants ||
          chatData.participants.length === 0)
      ) {
        throw new ValidationError(
          "Group chats must have a name and at least one participant."
        );
      }

      if (
        chatData.type === "broadcast" &&
        (!chatData.participants || chatData.participants.length === 0)
      ) {
        throw new ValidationError("Broadcast chats must have participants.");
      }

      if (!chatData.local_id) {
        throw new ValidationError("local_id is required for chat creation.");
      }

      // **Duplicate Chat Check**
      let existingChat: IChat | null = await findExistingChat(chatData);

      if (existingChat) {
        // If a chat already exists, return it instead of creating a new one
        return existingChat;
      }

      // **Exclude _id from chatData to Prevent Casting Errors**
      const { _id, ...restChatData } = chatData;

      // **Sort Participants for Consistency in Simple Chats**
      if (restChatData.type === "simple" && restChatData.participants) {
        restChatData.participants = restChatData.participants
          .map((p) => p)
          .sort();
      }

      // **Create the New Chat Instance with Server-Generated _id**
      const chat = new Chat({
        ...restChatData,
        // Let Mongoose handle _id generation
        messages: restChatData.messages || [],
        status: "created",
      });

      // **Save the Chat to the Database**
      await chat.save();

      // **Return the Newly Created Chat Object**
      return chat;
    } catch (error: any) {
      // **Handle Duplicate Key Errors**
      if (error.code === 11000) {
        console.error("Duplicate chat creation attempt detected:", error);

        let existingChat: IChat | null = await findExistingChat(chatData);

        if (existingChat) {
          return existingChat;
        }

        throw new DuplicateChatError(
          "A chat with the provided details already exists."
        );
      }

      // **Log and Rethrow Other Errors**
      console.error("Error creating chat:", error);
      throw error instanceof ValidationError
        ? error
        : new Error("Failed to create chat");
    }
  }

  static async findOrCreateChat(
    userId: string,
    botId: string,
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>  // Pass the io instance to emit events
  ): Promise<string> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const botObjectId = new mongoose.Types.ObjectId(botId);

      // Atomic operation to find or create
      const chat = await Chat.findOneAndUpdate(
        {
          type: "simple",
          participants: { $all: [userObjectId, botObjectId], $size: 2 },
        },
        {}, // No update
        {
          new: true, // Return the new document if upserted
          upsert: true, // Create the document if it doesn't exist
          setDefaultsOnInsert: true,
          fields: { _id: 1, participants: 1 }, // Return _id and participants fields
        }
      ).exec();

      // Check if the chat was newly created
      if (chat.isNew) {
        // Emit 'chat:newChat' event to the user and bot's rooms
        chat.participants.forEach(participantId => {
          const participantRoomId = `user:${participantId.toString()}`;
          io.to(participantRoomId).emit("chat:newChat", {
            chat: chat,
          });
          logger.info(`Emitting chat:newChat for newly created chat ${chat._id.toString()}`);
        });
      }

      logger.debug(`Chat found or created with ID: ${chat._id.toString()}`);
      return chat._id.toString();
    } catch (error) {
      logger.error(
        `Error in atomic findOrCreateChat for user ${userId} and bot ${botId}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }


  // Add a message to an existing chat
  static async addMessage(
    chatId: string,
    messageData: Partial<IMessage>
  ): Promise<IChat | null> {
    try {
      // Ensure message data is valid
      if (
        !messageData.sender ||
        !messageData.content ||
        !messageData.messageType
      ) {
        throw new Error("Invalid message data.");
      }

      // Create a new message object with both server and client IDs
      const newMessage = {
        ...messageData,
        _id: new mongoose.Types.ObjectId(), // Ensure _id is a valid ObjectId generated by the server
        status: "sent",
      };

      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { messages: newMessage }, $set: { updatedAt: new Date() } },
        { new: true, runValidators: true }
      ).lean();

      if (!chat) {
        throw new Error("Chat not found");
      }

      return chat;
    } catch (error) {
      console.error("Error adding message:", error);
      throw new Error("Failed to add message");
    }
  }

  static async sendAutomatedMessageToUsers(
    userIds: string[],
    messageData: Partial<IMessage>,
    botId: string,
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> // Accept io instance here

  ): Promise<string[]> {
    // Return type is Promise<string[]>
    const startTime = Date.now(); // For performance logging




    try {
      logger.info("sendAutomatedMessageToUsers called with data", {
        userIds,
        messageData,
        botId,
      });

       // Capture a single timestamp for consistency
     const currentTimestamp = new Date();

      // Convert userIds to ObjectId with validation
      const userObjectIds = userIds.map((id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          logger.error(`Invalid user ID: ${id}`);
          throw new Error(`Invalid user ID: ${id}`);
        }
        return new Types.ObjectId(id);
      });

      const botObjectId = new Types.ObjectId(botId);

      const bulkOperations: mongoose.AnyBulkWriteOperation<IChat>[] = [];
      const chatIds: string[] = [];

      // Generate the automated message only once
      const automatedMessage: Partial<IMessage> = {
        ...messageData,
        sender: botObjectId, // Store as string; conversion handled in DB operations
        readBy: [botObjectId],
        status: "sent",
        timestamp: new Date(),
        messageType: messageData.messageType || "alert",
        content: messageData.content || "", // Ensure content is always defined
      };

    // Prepare bulk operations concurrently
    const chatIdPromises = userObjectIds.map(async (userId) => {
      try {
        const chatId = await this.findOrCreateChat(userId.toString(), botId, io);
        chatIds.push(chatId);

        bulkOperations.push({
          updateOne: {
            filter: { _id: new Types.ObjectId(chatId) },
            update: {
              $push: { messages: automatedMessage },
              $set: { updatedAt: currentTimestamp },
            },
          },
        });

        logger.debug(`Prepared bulk operation for chatId: ${chatId}`);
      } catch (error) {
        logger.error(`Error processing user ${userId.toString()}`, { error });
      }
    });

     // Await all chatIdPromises
     await Promise.all(chatIdPromises);

     // Execute bulk operations if any
     if (bulkOperations.length > 0) {
       try {
         await Chat.bulkWrite(bulkOperations, { ordered: false });
         logger.info(`Successfully sent automated messages to users`, {
           userIds: userIds,
           chatIds,
           durationMs: Date.now() - startTime,
         });
       } catch (error) {
         logger.error("Error executing bulk operations", { error });
         throw error;
       }
     } else {
       logger.warn("No bulk operations to execute");
     }

     return chatIds;
   } catch (error) {
     logger.error("Error in sendAutomatedMessageToUsers", { error });
     throw error; // Optionally rethrow if higher-level handling is needed
   }
 }

  // Function to update read status of messages using findOneAndUpdate
  static async updateReadStatus(
    chatId: string,
    messageIds: string[],
    userId: string
  ): Promise<IChat | null> {
    try {
      const chatObjectId = new Types.ObjectId(chatId);

      // Update the readBy array for each message without loading the whole document
      const updateResult = await Chat.findOneAndUpdate(
        { _id: chatObjectId },
        {
          $addToSet: {
            "messages.$[elem].readBy": userId,
          },
        },
        {
          arrayFilters: [{ "elem.local_id": { $in: messageIds } }],
          new: true,
          runValidators: true,
        }
      ).exec();

      if (!updateResult) {
        throw new Error("Chat not found or no matching messages to update");
      }

      return updateResult.toObject();
    } catch (error) {
      console.error("Error updating read status:", error);
      throw new Error("Failed to update read status");
    }
  }
}
