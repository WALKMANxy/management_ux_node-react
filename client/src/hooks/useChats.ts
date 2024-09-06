import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import {
  fetchAllChats,
  fetchMessages,
  markMessagesAsRead,
  sendMessage,
  setCurrentChat,
} from "../features/chat/chatSlice";
import { IMessage } from "../models/dataModels";
import { webSocketService } from "../services/webSocketService";

const useChatLogic = () => {
  const dispatch = useAppDispatch();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Redux selectors
  const chats = useAppSelector((state: RootState) => state.chats.chats);
  const currentChat = useAppSelector(
    (state: RootState) => state.chats.currentChat
  );
  const messages = useAppSelector(
    (state: RootState) =>
      state.chats.messageIdsByChat[currentChatId || ""]?.map(
        (messageId: string) => state.chats.messages[messageId]
      ) || []
  );

  useEffect(() => {
    webSocketService.connect();
    dispatch(fetchAllChats());

    return () => {
      webSocketService.disconnect();
    };
  }, [dispatch]);

  
  // Effect to fetch all chats on component mount
  useEffect(() => {
    dispatch(fetchAllChats());
  }, [dispatch]);

  // Effect to set current chat based on chatId change
  useEffect(() => {
    if (currentChatId) {
      dispatch(setCurrentChat(chats[currentChatId]));
      dispatch(fetchMessages({ chatId: currentChatId }));
    }
  }, [currentChatId, dispatch, chats]);

  // Select a chat by its ID
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    dispatch(markMessagesAsRead({ chatId }));
  };

  // Send a new message in the current chat
  const handleSendMessage = async (
    content: string,
    messageType: "message" | "alert" | "promo" | "visit"
  ) => {
    if (!currentChatId) return;

    const messageData: Partial<IMessage> = {
      content,
      sender: "", // Add logic to get the authenticated user ID
      messageType,
    };

    try {
      await dispatch(
        sendMessage({ chatId: currentChatId, messageData })
      ).unwrap();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    chats: Object.values(chats),
    currentChat,
    messages,
    selectChat,
    handleSendMessage,
  };
};

export default useChatLogic;
