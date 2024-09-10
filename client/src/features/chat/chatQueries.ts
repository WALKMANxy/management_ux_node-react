// src/store/queries/chatQueries.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IChat, IMessage } from "../../models/dataModels";
import {
  generateErrorResponse,
  handleApiError,
} from "../../utils/errorHandling";
import {
  createChat,
  fetchAllChats,
  fetchMessages,
  fetchMessagesFromMultipleChats,
  sendMessage,
  updateReadStatus,
} from "./api/chats";

// Define the RTK Query slice for chat-related endpoints
export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Chat", "Message"],
  endpoints: (builder) => ({
    // Endpoint to fetch all chats for the authenticated user
    fetchAllChats: builder.query<IChat[], void>({
      queryFn: async () => {
        try {
          const chats = await fetchAllChats();
          return { data: chats };
        } catch (error) {
          handleApiError(error, "fetchAllChats");
          return generateErrorResponse(error);
        }
      },
      providesTags: ["Chat"],
    }),

    fetchMessages: builder.query<
      IMessage[],
      { chatId: string; page?: number; limit?: number }
    >({
      queryFn: async ({ chatId, page = 1, limit = 20 }) => {
        try {
          const messages = await fetchMessages(chatId, page, limit);
          return { data: messages };
        } catch (error) {
          handleApiError(error, "fetchMessages");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result, _error, { chatId }) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Message" as const,
                id: _id,
              })),
              { type: "Chat" as const, id: chatId },
            ]
          : [{ type: "Message" as const, id: chatId }],
    }),

    fetchMessagesFromMultipleChats: builder.query<
      { chatId: string; messages: IMessage[] }[],
      string[]
    >({
      queryFn: async (chatIds) => {
        try {
          const messagesFromChats = await fetchMessagesFromMultipleChats(
            chatIds
          );
          return { data: messagesFromChats };
        } catch (error) {
          handleApiError(error, "fetchMessagesFromMultipleChats");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.flatMap(({ chatId, messages }) => [
                { type: "Chat" as const, id: chatId },
                ...messages.map(({ _id }) => ({
                  type: "Message" as const,
                  id: _id,
                })),
              ]),
            ]
          : [],
    }),

    // Endpoint to create a new chat
    createChat: builder.mutation<IChat, Partial<IChat>>({
      queryFn: async (chatData) => {
        try {
          const newChat = await createChat(chatData);
          return { data: newChat };
        } catch (error) {
          handleApiError(error, "createChat");
          return generateErrorResponse(error);
        }
      },
      invalidatesTags: ["Chat"],
    }),

    // Endpoint to send a new message to a chat
    sendMessage: builder.mutation<
      IMessage,
      { chatId: string; messageData: Partial<IMessage> }
    >({
      queryFn: async ({ chatId, messageData }) => {
        try {
          const message = await sendMessage(chatId, messageData);
          return { data: message };
        } catch (error) {
          handleApiError(error, "sendMessage");
          return generateErrorResponse(error);
        }
      },
      invalidatesTags: (result, _error, { chatId }) =>
        result
          ? [
              { type: "Message" as const, id: result._id },
              { type: "Chat" as const, id: chatId },
            ]
          : [],
    }),

    // Endpoint to update read status of a message
    updateReadStatus: builder.mutation<
      IChat,
      { chatId: string; messageIds: string[] }
    >({
      queryFn: async ({ chatId, messageIds }) => {
        try {
          const updatedChat = await updateReadStatus(chatId, messageIds);
          return { data: updatedChat };
        } catch (error) {
          handleApiError(error, "updateReadStatus");
          return generateErrorResponse(error);
        }
      },
      invalidatesTags: (result, _error, { chatId, messageIds }) =>
        result
          ? [
              { type: "Chat" as const, id: chatId },
              ...messageIds.map((id) => ({ type: "Message" as const, id })),
            ]
          : [],
    }),
  }),
});

export const {
  useFetchAllChatsQuery,
  useFetchMessagesQuery,
  useFetchMessagesFromMultipleChatsQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useUpdateReadStatusMutation,
} = chatApi;