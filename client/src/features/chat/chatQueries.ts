// src/store/queries/chatQueries.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  generateErrorResponse,
  handleApiError,
} from "../../utils/errorHandling";
import { IChat, IMessage } from "../../models/dataModels";
import { apiCall } from "../../utils/apiUtils";

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
          const chats = await apiCall<IChat[]>(`chats`, "GET");
          return { data: chats };
        } catch (error) {
          handleApiError(error, "fetchAllChats");
          return generateErrorResponse(error);
        }
      },
      providesTags: ["Chat"],
    }),

    // Endpoint to fetch messages for a specific chat with pagination
    fetchMessages: builder.query<IMessage[], { chatId: string; page?: number; limit?: number }>({
      queryFn: async ({ chatId, page = 1, limit = 20 }) => {
        try {
          const messages = await apiCall<IMessage[]>(
            `chats/${chatId}/messages?page=${page}&limit=${limit}`,
            "GET"
          );
          return { data: messages };
        } catch (error) {
          handleApiError(error, "fetchMessages");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result, _error, { chatId }) =>
        result
          ? result.map(({ _id }) => ({ type: "Message", id: _id }))
          : [{ type: "Message", id: chatId }],
    }),

    // Endpoint to create a new chat
    createChat: builder.mutation<IChat, Partial<IChat>>({
      queryFn: async (chatData) => {
        try {
          const newChat = await apiCall<IChat>(`chats`, "POST", chatData);
          return { data: newChat };
        } catch (error) {
          handleApiError(error, "createChat");
          return generateErrorResponse(error);
        }
      },
      invalidatesTags: ["Chat"],
    }),

    // Endpoint to send a new message to a chat
    sendMessage: builder.mutation<IMessage, { chatId: string; messageData: Partial<IMessage> }>({
      queryFn: async ({ chatId, messageData }) => {
        try {
          const message = await apiCall<IMessage>(
            `chats/${chatId}/messages`,
            "POST",
            messageData
          );
          return { data: message };
        } catch (error) {
          handleApiError(error, "sendMessage");
          return generateErrorResponse(error);
        }
      },
      invalidatesTags: (result, _error, { chatId }) =>
        result ? [{ type: "Message", id: result._id }, { type: "Chat", id: chatId }] : [],
    }),

    // Endpoint to update read status of a message
    updateReadStatus: builder.mutation<IChat, { chatId: string; messageId: string }>({
      queryFn: async ({ chatId, messageId }) => {
        try {
          const updatedChat = await apiCall<IChat>(
            `chats/${chatId}/messages/${messageId}/read`,
            "PATCH"
          );
          return { data: updatedChat };
        } catch (error) {
          handleApiError(error, "updateReadStatus");
          return generateErrorResponse(error);
        }
      },
      invalidatesTags: (result, _error, { chatId, messageId }) =>
        result
          ? [
              { type: "Chat", id: chatId },
              { type: "Message", id: messageId },
            ]
          : [],
    }),
  }),
});

export const {
  useFetchAllChatsQuery,
  useFetchMessagesQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useUpdateReadStatusMutation,
} = chatApi;
