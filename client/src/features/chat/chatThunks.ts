/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/chat/chatThunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import imageCompression from "browser-image-compression";
import { RootState } from "../../app/store";
import { Attachment, IChat, IMessage } from "../../models/dataModels";
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
  selectAttachment,
  updateAttachmentProgress,
  uploadAttachmentFailed,
  uploadComplete,
} from "./chatSlice";

interface FetchOlderMessagesParams {
  chatId: string;
  oldestTimestamp: Date;
  limit: number;
}

interface chatThunkError extends Error {
  statusCode?: number;
  message: string;
}

interface RetryAttachmentsPayload {
  chatId: string;
  messageLocalId: string;
}

interface UploadAttachmentsPayload {
  chatId: string;
  message: IMessage;
}

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
          return false;
        }
        return true;
      },
    }
  );
};

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

export const retryFailedAttachmentsThunk = createAsyncThunk<
  void,
  RetryAttachmentsPayload,
  { state: RootState; rejectValue: string }
>(
  "chats/retryFailedAttachments",
  async (
    { chatId, messageLocalId },
    { dispatch, getState, rejectWithValue }
  ) => {
    /* console.groupCollapsed(
      `Retrying failed attachments for chatId=${chatId}, messageLocalId=${messageLocalId}`
    ); */

    const state = getState();
    const chat = state.chats.chats[chatId];
    if (!chat) {
      console.error("Chat does not exist in the state.");
      return rejectWithValue("Chat does not exist in the state.");
    }

    const message = chat.messages.find(
      (msg) => msg.local_id === messageLocalId
    );
    if (!message) {
      console.error("Message does not exist in the state.");
      return rejectWithValue("Message does not exist in the state.");
    }

    // console.log(`Found message: ${message.local_id}`);

    // Find failed attachments
    const failedAttachments = message.attachments.filter(
      (att) => att.status === "failed"
    );

    if (failedAttachments.length === 0) {
      // console.log("No failed attachments to retry.");
      return;
    }

    /*  console.log(
      `Found ${failedAttachments.length} failed attachment(s) to retry.`
    ); */

    let hasFailed = false; // Flag to track any failures
    const uploadedAttachments: Attachment[] = [];

    for (const attachment of failedAttachments) {
      try {
        // console.log(`Retrying upload for attachment: ${attachment.fileName}`);

        // Validate attachment properties
        if (!attachment.file || !attachment.chatId || !attachment.messageId) {
          console.error(
            "Attachment is missing required properties. Skipping this attachment."
          );
          continue;
        }

        // Compress images if applicable
        let fileToUpload = attachment.file;
        if (attachment.type === "image") {
          const options = {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          // console.log(`Compressing image: ${fileToUpload.name}`);
          fileToUpload = await imageCompression(attachment.file, options);
          /* console.log(
            `Image compressed: original size=${attachment.file.size}, new size=${fileToUpload.size}`
          ); */
        }

        /*  console.log(
          `Requesting new pre-signed URL for file: ${attachment.fileName}`
        ); */
        const fileName = encodeURIComponent(attachment.fileName);

        const uploadUrl = await getChatFileUploadUrl(
          attachment.chatId,
          attachment.messageId,
          fileName
        );

        // console.log(`Received new pre-signed URL: ${uploadUrl}`);

        // console.log(`Uploading to S3 via pre-signed URL: ${uploadUrl}`);

        // Upload the file to S3
        await uploadFileToS3(
          fileToUpload,
          uploadUrl,
          fileName,
          (progress: number) => {
            /*  console.log(
              `Dispatching progress update: progress=${progress}% for attachment ${attachment.fileName}`
            ); */
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

        // After upload completes, retrieve the updated attachment from the store
        const updatedState = getState();
        const updatedAttachment = selectAttachment(updatedState, {
          chatId: attachment.chatId,
          messageLocalId: attachment.messageId!,
          attachmentFileName: attachment.fileName,
        });

        if (updatedAttachment) {
          uploadedAttachments.push({
            ...updatedAttachment,
            url: uploadUrl.split("?")[0],
          });
          /*  console.log(
            `Attachment ${attachment.fileName} re-uploaded successfully.`
          ); */
        } else {
          console.error(
            `Failed to retrieve attachment ${attachment.fileName} from the store.`
          );
          hasFailed = true;
          dispatch(
            uploadAttachmentFailed({
              chatId: attachment.chatId!,
              messageLocalId: attachment.messageId!,
              attachmentFileName: attachment.fileName,
            })
          );
          continue;
        }
      } catch (error: any) {
        console.error(
          `Failed to re-upload attachment ${attachment.fileName}:`,
          error
        );
        hasFailed = true; // Mark that at least one attachment failed

        dispatch(
          uploadAttachmentFailed({
            chatId: attachment.chatId!,
            messageLocalId: attachment.messageId!,
            attachmentFileName: attachment.fileName,
          })
        );
        continue;
      }
    }

    // console.log(`Finished retrying attachments.`);

    if (!hasFailed) {
      // All attachments uploaded successfully
      const updatedMessage: IMessage = {
        ...message,
        attachments: message.attachments.map((att) => {
          const uploaded = uploadedAttachments.find(
            (u) => u.fileName === att.fileName
          );
          return uploaded ? uploaded : att;
        }),
      };

      /*  console.log(
        `All attachments re-uploaded successfully. Dispatching uploadComplete.`
      ); */
      dispatch(uploadComplete({ chatId, message: updatedMessage }));
      // toast.success("All attachments re-uploaded successfully.");
    } else {
      console.warn("Some attachments failed to re-upload.");
      // toast.warn("Some attachments failed to re-upload. Please try again.");
    }

    console.groupEnd();
  }
);

export const uploadAttachmentsThunk = createAsyncThunk<
  void,
  UploadAttachmentsPayload,
  { state: RootState; rejectValue: string }
>(
  "chats/uploadAttachments",
  async ({ chatId, message }, { dispatch, getState, rejectWithValue }) => {
    console.groupCollapsed(
      `Starting attachment upload for chatId=${chatId}, messageId=${message.local_id}`
    );
    const uploadedAttachments: Attachment[] = [];
    let hasFailed = false; // Flag to track any failures

    for (const attachment of message.attachments) {
      /*  console.log(
        `Processing attachment: file=${attachment.file?.name}, type=${attachment.type}`
      ); */

      // Validate attachment properties
      if (!attachment.file || !attachment.chatId || !attachment.messageId) {
        console.error(
          "Attachment is missing required properties. Skipping this attachment."
        );
        continue;
      }

      try {
        /*  console.log(
          `Uploading attachment: file=${attachment.file.name}, type=${attachment.type}`
        ); */

        // Compress images if applicable
        let fileToUpload = attachment.file;

        // Video compression using FFmpeg, couldn't make it work.

        /*if (attachment.type === "video") {
          console.log(`Compressing video: ${fileToUpload.name}`);
          const outputFileName = `${
            fileToUpload.name.split(".")[0]
          }-compressed.mp4`;
          const compressedBlob = await compressVideo(
            fileToUpload,
            outputFileName
          );
          fileToUpload = blobToFile(compressedBlob, outputFileName); // Convert Blob to File
          console.log(
            `Video compressed: original size=${attachment.file.size}, new size=${fileToUpload.size}`
          );
        } */

        if (attachment.type === "image") {
          const options = {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          // console.log(`Compressing image: ${fileToUpload.name}`);
          fileToUpload = await imageCompression(attachment.file, options);
          /*  console.log(
            `Image compressed: original size=${attachment.file.size}, new size=${fileToUpload.size}`
          ); */
        }

        /*  console.log(
          `Requesting pre-signed URL for file: ${attachment.fileName}`
        ); */
        const fileName = encodeURIComponent(attachment.fileName);

        const uploadUrl = await getChatFileUploadUrl(
          attachment.chatId,
          attachment.messageId,
          fileName
        );

        // console.log(`Received pre-signed URL: ${uploadUrl}`);

        // console.log(`Uploading to S3 via pre-signed URL: ${uploadUrl}`);

        // Upload the file to S3
        await uploadFileToS3(
          fileToUpload,
          uploadUrl,
          fileName,
          (progress: number) => {
            // console.log(`Dispatching progress update: progress=${progress}%`);
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

        // After upload completes, retrieve the updated attachment from the store
        const state = getState();
        const updatedAttachment = selectAttachment(state, {
          chatId: attachment.chatId,
          messageLocalId: attachment.messageId!,
          attachmentFileName: attachment.fileName,
        });

        if (updatedAttachment) {
          uploadedAttachments.push({
            ...updatedAttachment,
            url: uploadUrl.split("?")[0],
          });
        } else {
          console.error(
            `Failed to retrieve attachment ${attachment.fileName} from the store.`
          );
          return rejectWithValue(
            `Failed to retrieve attachment ${attachment.fileName} from the store.`
          );
        }

        // console.log("Uploaded attachments:", uploadedAttachments);
        // console.log(`Attachment uploaded successfully: ${fileToUpload.name}`);
      } catch (error: any) {
        console.error("Failed to upload attachment:", error);
        hasFailed = true; // Mark that at least one attachment failed

        dispatch(
          uploadAttachmentFailed({
            chatId: attachment.chatId,
            messageLocalId: attachment.messageId!,
            attachmentFileName: attachment.fileName,
          })
        );
        continue;
      }
    }

    // console.log(`Finished processing all attachments.`);

    if (hasFailed) {
      console.warn("Some attachments failed to upload.");
    } else {
      // All attachments uploaded successfully
      const updatedMessage: IMessage = {
        ...message,
        attachments: uploadedAttachments,
      };

      // console.log(`All attachments uploaded. Dispatching uploadComplete.`);
      dispatch(uploadComplete({ chatId, message: updatedMessage }));
    }

    console.groupEnd();
  }
);
