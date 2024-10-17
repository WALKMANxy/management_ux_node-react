// src/api/chatApi.ts

import imageCompression from "browser-image-compression";
import { Dispatch } from "redux";
import { IChat, IMessage } from "../../../models/dataModels";
import { apiCall } from "../../../utils/apiUtils";
import { getChatFileUploadUrl, uploadFileToS3 } from "../../data/api/media";
import {
  updateAttachmentProgress,
  uploadAttachmentComplete,
  uploadAttachmentFailed,
  uploadComplete,
} from "../chatSlice";

// Fetch all chats for the authenticated user
export const fetchAllChats = async (): Promise<IChat[]> => {
  try {
    return await apiCall<IChat[]>("chats", "GET");
  } catch (error) {
    console.error("Error fetching all chats:", error);
    throw error;
  }
};

// Fetch a specific chat by its ID
export const fetchChatById = async (chatId: string): Promise<IChat> => {
  try {
    if (!chatId) {
      throw new Error("Chat ID is required.");
    }
    return await apiCall<IChat>(`chats/${chatId}`, "GET");
  } catch (error) {
    console.error(`Error fetching chat with ID ${chatId}:`, error);
    throw error;
  }
};

// Fetch messages for a specific chat with pagination
export const fetchMessages = async (
  chatId: string,
  page: number = 1,
  limit: number = 20
): Promise<IMessage[]> => {
  try {
    if (!chatId || page < 1 || limit < 1) {
      throw new Error("Invalid parameters for fetching messages.");
    }
    return await apiCall<IMessage[]>(
      `chats/${chatId}/messages?page=${page}&limit=${limit}`,
      "GET"
    );
  } catch (error) {
    console.error(`Error fetching messages for chat ${chatId}:`, error);
    throw error;
  }
};

// Fetch older messages for a specific chat
export const fetchOlderMessages = async (
  chatId: string,
  oldestTimestamp: Date,
  limit: number // Include limit parameter
): Promise<IMessage[]> => {
  try {
    const response = await apiCall<IMessage[]>(
      `chats/${chatId}/older-messages?oldestTimestamp=${encodeURIComponent(
        oldestTimestamp.toISOString()
      )}&limit=${limit}`, // Pass limit in the query string
      "GET"
    );
    return response;
  } catch (error) {
    console.error(`Error fetching older messages for chat ${chatId}:`, error);
    throw error;
  }
};

// Fetch messages across multiple chats
export const fetchMessagesFromMultipleChats = async (
  chatIds: string[]
): Promise<{ chatId: string; messages: IMessage[] }[]> => {
  try {
    if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
      throw new Error("Invalid chat IDs array.");
    }
    // Send chatIds in the request body instead of query params
    return await apiCall<{ chatId: string; messages: IMessage[] }[]>(
      `/chats/messages`,
      "POST",
      { chatIds } // Pass chatIds in the body
    );
  } catch (error) {
    console.error("Error fetching messages from multiple chats:", error);
    throw error;
  }
};

// Create a new chat (simple, group, or broadcast)
export const createChat = async (chatData: Partial<IChat>): Promise<IChat> => {
  try {
    // Perform client-side validation before sending the request
    if (
      !chatData.type ||
      !["simple", "group", "broadcast"].includes(chatData.type)
    ) {
      throw new Error("Invalid chat type.");
    }
    if (
      chatData.type === "group" &&
      (!chatData.name || !chatData.participants)
    ) {
      throw new Error("Group chats must have a name and participants.");
    }
    if (!chatData.local_id) {
      throw new Error("local_id is required for chat creation.");
    }
    return await apiCall<IChat>("/chats/create", "POST", chatData);
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

// Send a message to an existing chat
export const sendMessage = async (
  chatId: string,
  messageData: Partial<IMessage>
): Promise<IMessage> => {
  try {
    // Validate chatId and message content
    if (!chatId || !messageData.content || !messageData.sender) {
      throw new Error("Invalid message data.");
    }
    return await apiCall<IMessage>(
      `/chats/${chatId}/messages`,
      "POST",
      messageData
    );
  } catch (error) {
    console.error(`Error sending message to chat ${chatId}:`, error);
    throw error;
  }
};

// Update read status for multiple messages in a chat
export const updateReadStatus = async (
  chatId: string,
  messageIds: string[]
): Promise<IChat> => {
  try {
    // Validate IDs
    if (!chatId || !Array.isArray(messageIds) || messageIds.length === 0) {
      throw new Error("Invalid chat ID or message IDs.");
    }
    return await apiCall<IChat>(`/chats/${chatId}/messages/read`, "PATCH", {
      messageIds,
    });
  } catch (error) {
    console.error(
      `Error updating read status for messages in chat ${chatId}:`,
      error
    );
    throw error;
  }
};

export const uploadAttachments = async (
  chatId: string,
  message: IMessage,
  dispatch: Dispatch
) => {
  // Check if chatId and messageId are valid before proceeding
  if (!chatId || !message.local_id) {
    console.error("Invalid chatId or messageId. Aborting attachment upload.");
    return;
  }

  console.log(
    `Starting attachment upload for chatId=${chatId}, messageId=${message.local_id}`
  );


  for (const attachment of message.attachments) {
    // Check if attachment has necessary properties
    if (!attachment.file || !attachment.chatId || !attachment.messageId) {
      console.error(
        "Attachment is missing required properties. Skipping this attachment."
      );
      continue;
    }

    try {
      console.log(
        `Uploading attachment: file=${attachment.file.name}, type=${attachment.type}`
      );

      // Compress images if applicable
      let fileToUpload = attachment.file;
      if (attachment.type === "image") {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        console.log(`Compressing image: ${fileToUpload.name}`);
        fileToUpload = await imageCompression(attachment.file, options);
        console.log(
          `Image compressed: original size=${attachment.file.size}, new size=${fileToUpload.size}`
        );
      }

      // Request a pre-signed URL for the file
      const fileName = encodeURIComponent(attachment.fileName);
      const uploadUrl = await getChatFileUploadUrl(
        attachment.chatId,
        attachment.messageId,
        fileName
      );

      console.log(`Uploading to S3 via pre-signed URL: ${uploadUrl}`);

      // Upload the file to S3
      await uploadFileToS3(fileToUpload, uploadUrl, (progress) => {
        console.log(`Dispatching progress update: progress=${progress}%`);
        dispatch(
          updateAttachmentProgress({
            chatId: attachment.chatId!,
            messageLocalId: attachment.messageId!,
            attachmentFileName: attachment.fileName,
            progress,
          })
        );
      });

       // Dispatch upload complete action
       dispatch(
        uploadAttachmentComplete({
          chatId,
          messageLocalId: message.local_id,
          attachmentFileName: attachment.fileName,
          url: uploadUrl.split("?")[0], // Ensure you store the clean URL
        })
      );



      console.log(`Attachment uploaded successfully: ${fileToUpload.name}`);
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      dispatch(
        uploadAttachmentFailed({
          chatId: attachment.chatId,
          messageLocalId: attachment.messageId!,
            attachmentFileName: attachment.fileName,
        })
      );
      return;
    }
  }



  console.log(`All attachments uploaded. Dispatching uploadComplete.`);

  dispatch(uploadComplete({ chatId, message: { ...message } }));
};
