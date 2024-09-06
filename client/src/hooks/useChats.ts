import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";

import {
  fetchAllChats,
  fetchMessages,
  sendMessage,
  setCurrentChat,
} from "../features/chat/chatSlice";
import { IMessage } from "../models/dataModels";
import { webSocketService } from "../services/webSocketService";

const useChatLogic = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Redux selectors
  const chats = useSelector((state: RootState) => state.chats.chats);
  const currentChat = useSelector(
    (state: RootState) => state.chats.currentChat
  );
  const messages = useSelector(
    (state: RootState) =>
      state.chats.messageIdsByChat[currentChatId || ""]?.map(
        (messageId: string) => state.chats.messages[messageId]
      ) || []
  );

  // Effect to set up WebSocket event listeners
  useEffect(() => {
    webSocketService.connect();

    webSocketService.socket?.on(
      "chat:newMessage",
      webSocketService.handleNewMessage
    );
    webSocketService.socket?.on(
      "chat:messageRead",
      webSocketService.handleMessageRead
    );

    return () => {
      webSocketService.disconnect();
    };
  }, []);

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
