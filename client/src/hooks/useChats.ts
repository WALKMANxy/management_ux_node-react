import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import {
  fetchAllChats,
  fetchMessages,
  markMessagesAsReadReducer,
  sendMessageReducer,
  setCurrentChatReducer,
} from "../features/chat/chatSlice";
import { IMessage } from "../models/dataModels";
import { AuthState } from "../models/stateModels";
import { generateId } from "../utils/deviceUtils";

const useChatLogic = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const currentUserId: string = useSelector((state: AuthState) => state.userId);
  const userRole = useSelector((state: AuthState) => state.role); // Get the role of the current user

  // Users mapped by ID

  const users = useSelector((state: RootState) => state.users.users);

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

  // Extract client IDs from state.data.clients (relevant to the agent)
  const agentClientIds = useSelector(
    (state: RootState) => Object.keys(state.data.clients) // Extracts all client IDs
  );

  // Effect to fetch all chats on component mount
  useEffect(() => {
    dispatch(fetchAllChats());
  }, [dispatch]);

  // Effect to set current chat based on chatId change
  useEffect(() => {
    if (currentChatId) {
      dispatch(setCurrentChatReducer(chats[currentChatId])); // Update to correct reducer function
      dispatch(fetchMessages({ chatId: currentChatId }));
    }
  }, [currentChatId, dispatch, chats]);

  // Select a chat by its ID
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    dispatch(markMessagesAsReadReducer({ chatId, currentUserId }));
  };

  const handleChatOpen = (chatId: string, currentUserId: string) => {
    // Dispatch the action to mark all messages as read
    dispatch(markMessagesAsReadReducer({ chatId, currentUserId }));
  };

  // Send a new message in the current chat
  const handleSendMessage = async (
    content: string,
    messageType: "message" | "alert" | "promo" | "visit"
  ) => {
    if (!currentChatId) return;

    const messageData: IMessage = {
      localId: generateId(), // Use the improved localId generation function
      content,
      sender: currentUserId,
      timestamp: new Date(),
      readBy: [currentUserId], // Add logic to get the authenticated user ID
      messageType,
      attachments: [],
      status: "pending",
    };

    try {
      dispatch(sendMessageReducer({ chatId: currentChatId, messageData }));
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Search and filter users based on role
  const filterContacts = () => {
    if (userRole === "admin") {
      // Admin sees all users without any filtering
      return Object.values(users);
    } else if (userRole === "agent") {
      // Agent sees other agents, admins, and their assigned clients
      return Object.values(users).filter(
        (user) =>
          user.role === "admin" || // Include admins
          user.role === "agent" || // Include other agents
          (user.role === "client" &&
            user.entityCode && // Ensure entityCode is defined
            agentClientIds.includes(user.entityCode)) // Filter using entityCode matching the agent's client IDs
      );
    } else if (userRole === "client") {
      // Clients can see agents and admins, but not other clients
      return Object.values(users).filter(
        (user) => user.role === "admin" || user.role === "agent" // Include only admins and agents
      );
    }
  };

  return {
    chats: Object.values(chats),
    currentChat,
    messages,
    users,
    selectChat,
    handleSendMessage,
    handleChatOpen,
    filterContacts, // Function to filter contacts based on the role
  };
};

export default useChatLogic;
