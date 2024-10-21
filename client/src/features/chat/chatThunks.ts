/* eslint-disable @typescript-eslint/no-explicit-any */
// Async thunk to fetch all chats for the user

import { createAsyncThunk, Dispatch } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { RootState } from "../../app/store";
import { IChat, IMessage } from "../../models/dataModels";
import { showToast } from "../../services/toastMessage";
import { getChatFileUploadUrl, uploadFileToS3 } from "../data/api/media";
import {
  createChat,
  fetchAllChats,
  fetchMessages,
  fetchMessagesFromMultipleChats,
  fetchOlderMessages,
  sendMessage,
  updateReadStatus,
} from "./api/chats";
import {
  updateAttachmentProgress,
  uploadAttachmentFailed,
  uploadComplete,
} from "./chatSlice";

interface FetchOlderMessagesParams {
  chatId: string;
  oldestTimestamp: Date;
  limit: number; // Include limit parameter
}

interface chatThunkError extends Error {
  statusCode?: number;
  message: string;
}

// Helper function to create authenticated thunks
const createAuthenticatedThunk = <Returned, ThunkArg>(
  type: string,
  payloadCreator: (arg: ThunkArg, thunkAPI: any) => Promise<Returned>
) => {
  return createAsyncThunk<Returned, ThunkArg, { rejectValue: string }>(
    type,
    payloadCreator,
    {
      condition: (_, { getState }) => {
        const state = getState() as RootState;
        if (!state.auth.isLoggedIn) {
          return false; // Prevent the thunk from executing
        }
        return true; // Allow the thunk to execute
      },
    }
  );
};

// Refactored async thunk to fetch all chats for the user
export const fetchAllChatsThunk = createAuthenticatedThunk<IChat[], void>(
  "chats/fetchAllChatsThunk",
  async (_, { rejectWithValue }) => {
    try {
      const result = await fetchAllChats(); // Direct API call
      return result; // Return the fetched chats
    } catch (error) {
      const typedError = error as chatThunkError;
      console.error(`Failed to fetch chats: ${typedError.message}`);
      return rejectWithValue(typedError.message || "Failed to fetch chats");
    }
  }
);

// Refactored async thunk to fetch messages for a specific chat
export const fetchMessagesThunk = createAsyncThunk<
  { chatId: string; messages: IMessage[] },
  { chatId: string; page?: number; limit?: number },
  { rejectValue: string }
>(
  "chats/fetchMessagesThunk",
  async ({ chatId, page = 1, limit = 25 }, { rejectWithValue }) => {
    try {
      const messages = await fetchMessages(chatId, page, limit);
      return { chatId, messages };
    } catch (error) {
      const typedError = error as chatThunkError;
      console.error(`Failed to fetch messages: ${typedError.message}`);
      return rejectWithValue(typedError.message || "Failed to fetch messages");
    }
  }
);

// Thunk action to fetch older messages
export const fetchOlderMessagesThunk = createAsyncThunk<
  { chatId: string; messages: IMessage[] },
  FetchOlderMessagesParams,
  { rejectValue: string }
>(
  "chats/fetchOlderMessagesThunk",
  async ({ chatId, oldestTimestamp, limit }, { rejectWithValue }) => {
    try {
      const messages = await fetchOlderMessages(chatId, oldestTimestamp, limit);
      return { chatId, messages };
    } catch (error) {
      const typedError = error as chatThunkError;
      console.error(`Error fetching older messages: ${typedError.message}`);
      return rejectWithValue(
        typedError.message || "Failed to fetch older messages"
      );
    }
  }
);

// Refactored async thunk to fetch messages from multiple chats
export const fetchMessagesFromMultipleChatsThunk = createAsyncThunk<
  { chatId: string; messages: IMessage[] }[],
  string[],
  { rejectValue: string }
>(
  "chats/fetchMessagesFromMultipleChatsThunk",
  async (chatIds, { rejectWithValue }) => {
    try {
      const result = await fetchMessagesFromMultipleChats(chatIds);
      return result;
    } catch (error) {
      const typedError = error as chatThunkError;
      console.error(`Error fetching messages: ${typedError.message}`);
      return rejectWithValue(
        typedError.message || "Failed to fetch messages from multiple chats"
      );
    }
  }
);

// Refactored async thunk to create a new chat
export const createChatThunk = createAsyncThunk<
  IChat,
  Partial<IChat>,
  { rejectValue: string }
>("chats/createChatThunk", async (chatData, { rejectWithValue }) => {
  try {
    const result = await createChat(chatData);
    showToast.success("Chat created successfully!");
    return result;
  } catch (error) {
    const typedError = error as chatThunkError;
    console.error(`Failed to create chat: ${typedError.message}`);
    return rejectWithValue(typedError.message || "Failed to create chat");
  }
});

// Refactored async thunk to create a new message
export const createMessageThunk = createAsyncThunk<
  { chatId: string; message: IMessage },
  { chatId: string; messageData: Partial<IMessage> },
  { rejectValue: string }
>(
  "messages/createMessageThunk",
  async ({ chatId, messageData }, { rejectWithValue }) => {
    try {
      const message = await sendMessage(chatId, messageData);
      return { chatId, message };
    } catch (error) {
      const typedError = error as chatThunkError;
      console.error(`Failed to create message: ${typedError.message}`);
      return rejectWithValue(typedError.message || "Failed to send message");
    }
  }
);

// Refactored async thunk to update read status for multiple messages
export const updateReadStatusThunk = createAsyncThunk<
  IChat,
  { chatId: string; messageIds: string[] },
  { rejectValue: string }
>(
  "chats/updateReadStatusThunk",
  async ({ chatId, messageIds }, { rejectWithValue }) => {
    try {
      const result = await updateReadStatus(chatId, messageIds);
      return result;
    } catch (error) {
      const typedError = error as chatThunkError;
      console.error(
        `Failed to update message read status: ${typedError.message}`
      );
      return rejectWithValue(
        typedError.message || "Failed to update read status"
      );
    }
  }
);

// Thunk action to retry failed attachments
export const retryFailedAttachments =
  (chatId: string, messageLocalId: string) =>
  async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const chat = state.chats.chats[chatId];
    if (!chat) {
      console.error("Chat does not exist in the state.");
      return;
    }

    const message = chat.messages.find(
      (msg) => msg.local_id === messageLocalId
    );
    if (!message) {
      console.error("Message does not exist in the state.");
      return;
    }

    console.log(`Retrying failed attachments for message: ${message.local_id}`);

    // Find failed attachments
    const failedAttachments = message.attachments.filter(
      (att) => att.status === "failed"
    );

    if (failedAttachments.length === 0) {
      console.log("No failed attachments to retry.");
      return;
    }
    for (const attachment of failedAttachments) {
      try {
        console.log(`Retrying upload for attachment: ${attachment.fileName}`);

        // Request a new pre-signed URL for the file
        const uploadUrl = await getChatFileUploadUrl(
          attachment.chatId!,
          attachment.messageId!,
          encodeURIComponent(attachment.fileName)
        );
        console.log(`Received pre-signed URL for retry: ${uploadUrl}`);
        // Upload the file to S3
        await uploadFileToS3(
          attachment.file!, // Now accessible
          uploadUrl,
          attachment.fileName,
          (progress: number) => {
            dispatch(
              updateAttachmentProgress({
                chatId: attachment.chatId!,
                messageLocalId: attachment.messageId!,
                attachmentFileName: attachment.fileName,
                progress,
              })
            );
          }
        );
        console.log(
          `Attachment ${attachment.fileName} re-uploaded successfully.`
        );
      } catch (error) {
        console.error(
          `Failed to re-upload attachment ${attachment.fileName}:`,
          error
        );
        dispatch(
          uploadAttachmentFailed({
            chatId: attachment.chatId!,
            messageLocalId: attachment.messageId!,
            attachmentFileName: attachment.fileName,
          })
        );
      }
    }
    // After retrying all, check if all attachments are now uploaded
    const updatedState = getState();
    const updatedChat = updatedState.chats.chats[chatId];
    const updatedMessage = updatedChat.messages.find(
      (msg) => msg.local_id === messageLocalId
    );
    if (updatedMessage?.attachments.every((att) => att.status === "uploaded")) {
      dispatch(uploadComplete({ chatId, message: updatedMessage }));
      toast.success("All attachments uploaded successfully.");
    } else {
      console.warn("Some attachments still failed to upload after retry.");
      toast.info("Some attachments failed to upload. Please retry.");
      // Optionally, you can implement further actions or notifications
    }
  };
