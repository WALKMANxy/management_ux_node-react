import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import store, { AppDispatch, RootState } from "../app/store";
import {
  addMessageReducer,
  fetchAllChatsThunk,
  fetchMessagesThunk,
  selectMessagesByChatId,
  setCurrentChatReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice";
import { getAllUsersThunk } from "../features/users/userSlice";
import { IChat, IMessage } from "../models/dataModels";
import { webSocketService } from "../services/webSocketService";
import { generateId } from "../utils/deviceUtils";

const useChatLogic = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loadingContacts, setLoadingContacts] = useState(false); // Loading state for contacts

  // Add debug statements here
  const currentUserId = useSelector((state: RootState) => state.auth.userId);
  const userRole = useSelector((state: RootState) => state.auth.role);
  const users = useSelector((state: RootState) => state.users.users);

  console.log("useChatLogic: Current User ID:", currentUserId); // Debug: Check current user ID
  console.log("useChatLogic: User Role:", userRole); // Debug: Check user role
  console.log("useChatLogic: Users:", users); // Debug: Check users state

  console.log("Combined debug info:", { currentUserId, userRole, users });

  useEffect(() => {
    console.log("THIS SI TEH CURRENT CHAT IDDD", currentChatId);
  }, [currentChatId]);

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
    dispatch(fetchAllChatsThunk());
  }, [dispatch]);

  // Select a chat by its ID
  const selectChat = (chatId: string) => {
    console.log("Selecting chat with ID:", chatId); // Debug: Log the chatId being selected

    // Set the current chat
    setCurrentChatId(chatId);

    console.log("CurrentChatId after setting:", currentChatId); // Debug: Check if currentChatId is set

    // Retrieve the messages associated with the selected chat from the state
    const messages = selectMessagesByChatId(store.getState(), chatId);

    console.log("Messages retrieved for chatId:", chatId, messages); // Debug: Log retrieved messages

    // Identify unread messages for the current user
    const unreadMessageIds = messages
      .filter(
        (message) =>
          !message.readBy.includes(currentUserId) &&
          message.sender !== currentUserId
      )
      .map((message) => message.local_id || message._id); // Use `local_id` if available, fallback to `_id`

    console.log("Unread message IDs:", unreadMessageIds); // Debug: Log unread message IDs

    // Dispatch action to update read status with the unread message IDs
    if (unreadMessageIds.length > 0) {
      dispatch(
        updateReadStatusReducer({
          chatId,
          userId: currentUserId,
          messageIds: unreadMessageIds,
        })
      );
      console.log("Updated read status for messages"); // Debug: Log read status update
    }
  };

  // Effect to set current chat based on chatId change
  useEffect(() => {
    console.log(
      "useEffect triggered for currentChatId change. currentChatId:",
      currentChatId
    ); // Debug: Log when useEffect is triggered

    if (currentChatId) {
      const selectedChat = chats[currentChatId];
      console.log("Dispatching setCurrentChatReducer with chat:", selectedChat); // Debug: Log the chat being set

      dispatch(setCurrentChatReducer(selectedChat)); // Update to correct reducer function

      console.log("Fetching messages for chatId:", currentChatId); // Debug: Log fetching messages
      dispatch(fetchMessagesThunk({ chatId: currentChatId }))
        .unwrap()
        .then((messages) => {
          console.log("Fetched messages:", messages); // Debug: Log fetched messages
        })
        .catch((error) => {
          console.error("Error fetching messages:", error); // Debug: Log any errors in fetching
        });
    } else {
      console.warn("currentChatId is null or undefined, skipping fetch."); // Debug: Log when currentChatId is missing
    }
  }, [currentChatId, dispatch, chats]);

  // Function to fetch contacts when switching to contacts view
  const fetchContacts = async () => {
    console.log("fetchContacts called"); // Debug: Log when fetchContacts is called
    setLoadingContacts(true); // Set loading state to true
    try {
      console.log("Dispatching getAllUsersThunk..."); // Debug: Log before dispatch
      const result = await dispatch(getAllUsersThunk()).unwrap(); // Unwraps the result to handle errors
      console.log("Fetched contacts:", result); // Debug: Log the fetched contacts data
    } catch (error) {
      console.error("Failed to fetch contacts:", error); // Debug: Error case
    } finally {
      setLoadingContacts(false); // Reset loading state
      console.log("Loading contacts state set to false"); // Debug: Log after loading state reset
    }
  };

  // Send a new message in the current chat
  const handleSendMessage = useCallback(
    async (
      content: string,
      messageType: "message" | "alert" | "promo" | "visit"
    ) => {
      console.log("Attempting to send a message:", {
        currentChatId,
        currentUserId,
      });

      if (!currentChatId || !currentUserId) {
        console.error("Missing currentChatId or currentUserId:", {
          currentChatId,
          currentUserId,
        });
        return;
      }

      // Generate a local ID for the message
      const localId = generateId();

      const messageData: IMessage = {
        _id: localId,
        local_id: localId,
        content,
        sender: currentUserId,
        timestamp: new Date(),
        readBy: [currentUserId],
        messageType,
        attachments: [],
        status: "pending",
      };

      try {
        dispatch(
          addMessageReducer({ chatId: currentChatId, message: messageData })
        );
        console.log("Message sent successfully:", messageData);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [currentChatId, currentUserId, dispatch] // Add currentChatId to dependencies
  );

  // Chat creation handler using createChatThunk
  const handleCreateChat = async (
    participants: string[],
    chatType: "simple" | "group" | "broadcast",
    name?: string,
    description?: string
  ) => {
    if (!participants.length) return;

    const localId = generateId();

    const chatData: IChat = {
      _id: localId,
      local_id: localId,
      type: chatType,
      participants,
      name,
      description,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
    };

    try {
      // Emit the new chat creation request to the server via WebSocket
      webSocketService.emitNewChat(chatData);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  // Handle selecting a contact to open or create a chat
  const handleContactSelect = (contactId: string) => {
    // Check if there's an existing chat with this contact
    const existingChat = Object.values(chats).find(
      (chat) =>
        chat.type === "simple" &&
        chat.participants.includes(contactId) &&
        chat.participants.includes(currentUserId)
    );

    if (existingChat) {
      // If chat exists, select it
      selectChat(existingChat._id);
    } else {
      // If no chat exists, create a new one
      handleCreateChat([currentUserId, contactId], "simple");
    }
  };

  const filteredContacts = useMemo(() => {
    // Log the current user ID for reference
    console.log("Current User ID:", currentUserId);

    // Filter contacts based on the user role and exclude the current user
    if (userRole === "admin") {
      // Admin sees all users except themselves
      return Object.values(users).filter((user) => user._id !== currentUserId);
    } else if (userRole === "agent") {
      // Agent sees other agents, admins, and their assigned clients, excluding themselves
      return (
        Object.values(users).filter(
          (user) =>
            user._id !== currentUserId && // Exclude the current user
            (user.role === "admin" ||
              user.role === "agent" ||
              (user.role === "client" &&
                user.entityCode &&
                agentClientIds.includes(user.entityCode)))
        ) || []
      );
    } else if (userRole === "client") {
      // Clients can see agents and admins, but not other clients, and exclude themselves
      return (
        Object.values(users).filter(
          (user) =>
            user._id !== currentUserId && // Exclude the current user
            (user.role === "admin" || user.role === "agent")
        ) || []
      );
    }

    // Default return if no contacts are found
    console.log(
      "User role not recognized or no contacts found. Returning empty array."
    );
    return [];
  }, [users, userRole, agentClientIds, currentUserId]); // Dependencies array

  return {
    chats: Object.values(chats),
    currentChat,
    messages,
    users,
    selectChat,
    handleSendMessage,
    handleCreateChat,
    handleContactSelect,
    fetchContacts, // Add fetchContacts to be used when toggling to contacts view
    loadingContacts, // Provide loading state
    filteredContacts, // Function to filter contacts based on the role
  };
};

export default useChatLogic;
