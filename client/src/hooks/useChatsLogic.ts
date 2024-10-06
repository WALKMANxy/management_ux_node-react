import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useAppDispatch /* useAppSelector */ } from "../app/hooks";
import { selectUserId, selectUserRole } from "../features/auth/authSlice";
import {
  addChatReducer,
  updateChatReducer,
  addMessageReducer,
  clearCurrentChatReducer,
  selectAllChats,
  selectCurrentChat,
  selectMessagesFromCurrentChat,
  setCurrentChatReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice"; // Ensure correct selectors are imported
import { fetchAllChatsThunk } from "../features/chat/chatThunks";
import { selectClientIds } from "../features/data/dataSlice";
import { getAllUsersThunk, selectAllUsers } from "../features/users/userSlice";
import { IChat, IMessage } from "../models/dataModels";
import { showToast } from "../services/toastMessage";
import { sanitizeSearchTerm } from "../utils/chatUtils";
import { generateId } from "../utils/deviceUtils";

const useChatLogic = () => {
  const dispatch = useAppDispatch();
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chatRetryCount, setChatRetryCount] = useState(0);
  const [chatError, setChatError] = useState<string | null>(null);

  // Selectors
  const currentUserId = useSelector(selectUserId);
  const userRole = useSelector(selectUserRole);
  const users = useSelector(selectAllUsers);
  const chats: IChat[] = useSelector(selectAllChats); // Use selector to get all chats
  const currentChat: IChat | null = useSelector(selectCurrentChat); // Allow null values
  const messages = useSelector(selectMessagesFromCurrentChat); // Use selector to get messages of the current chat
  const [contactsFetched, setContactsFetched] = useState(false);
  const { t } = useTranslation();

  const agentClientIds = useSelector(selectClientIds);

  const currentChatId = useMemo(() => currentChat?._id, [currentChat]);

  const fetchChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      await dispatch(fetchAllChatsThunk()).unwrap();
      setChatError(null); // Clear any previous errors if successful
      setChatRetryCount(0); // Reset retry count on success
    } catch (err: unknown) {
      console.error("Error fetching chats:", err);
      if (err instanceof Error) {
        setChatError(err.message);
      } else {
        setChatError("An unknown error occurred while fetching chats.");
      }
      // Increment retry count only if it's less than the limit
      if (chatRetryCount < 5) {
        setChatRetryCount((prevCount) => prevCount + 1);
      }
    } finally {
      setLoadingChats(false);
    }
  }, [dispatch, chatRetryCount]);

  // Fetch chats with retry mechanism
  useEffect(() => {
    // Call fetchChats initially
    fetchChats();
  }, [dispatch, chatRetryCount, fetchChats]);

  // Retry mechanism
  useEffect(() => {
    if (chatRetryCount > 0 && chatRetryCount <= 5) {
      const retryDelay = Math.min(32000, 1000 * 2 ** chatRetryCount); // Exponential backoff

      const retryTimeout = setTimeout(() => {
        // console.log(`Retry attempt #${chatRetryCount}`);
        fetchChats();
      }, retryDelay);

      return () => {
        clearTimeout(retryTimeout);
      };
    }
  }, [chatRetryCount, fetchChats]);
  // Select a chat
  const selectChat = useCallback(
    (chat: IChat) => {
      // Determine the chat identifier: use _id if available, otherwise local_id
      const chatId = chat._id ? chat._id.toString() : chat.local_id;

      if (!chatId) {
        console.warn("Chat does not have an _id or local_id:", chat);
        return;
      }

      /*   console.log(`Selected chat ID: ${chatId}`); // Debug: Log chat ID
      console.log(`Chat name: ${chat.name}`); // Debug: Log chat name
      console.log(`Chat with ${chat.participants.length} members`); // Debug: Log the number of members */

      // Set the current chat in the state
      dispatch(setCurrentChatReducer(chat));

      // Identify unread messages
      const unreadMessageIds = chat.messages
        .filter(
          (message: IMessage) =>
            !message.readBy
              .map((id) => id.toString())
              .includes(currentUserId) &&
            message.sender.toString() !== currentUserId
        )
        .map((message) =>
          message.local_id
            ? message.local_id.toString()
            : message._id.toString()
        );

      /*   console.log(
        `Found ${unreadMessageIds.length} unread messages by ${currentUserId} in chat ${chatId}`
      ); */ // Debug: Log the number of unread messages

      // Update read status for unread messages
      if (unreadMessageIds.length > 0) {
        dispatch(
          updateReadStatusReducer({
            chatId: chatId,
            userId: currentUserId,
            messageIds: unreadMessageIds,
          })
        );
      }
    },
    [currentUserId, dispatch]
  );

  // Function to mark messages as read
  const markMessagesAsRead = useCallback(
    (chat: IChat, userId: string) => {
      if (chat._id) {
        const unreadMessageIds = chat.messages
          .filter(
            (message: IMessage) =>
              !message.readBy.map((id) => id.toString()).includes(userId) &&
              message.sender.toString() !== userId
          )
          .map((message) =>
            message.local_id
              ? message.local_id.toString()
              : message._id.toString()
          );

        if (unreadMessageIds.length > 0) {
          dispatch(
            updateReadStatusReducer({
              chatId: chat._id.toString(),
              userId: userId,
              messageIds: unreadMessageIds,
            })
          );
        }
      } else {
        console.warn("Chat does not have an _id:", chat);
        return;
      }
    },
    [dispatch]
  );

  // Fetch contacts when needed
  const fetchContacts = useCallback(async () => {
    if (contactsFetched) return;
    setLoadingContacts(true);
    try {
      await dispatch(getAllUsersThunk()).unwrap();
      setContactsFetched(true);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoadingContacts(false);
    }
  }, [dispatch, contactsFetched]);

  // Send a new message in the current chat
  const handleSendMessage = useCallback(
    async (
      content: string,
      messageType: "message" | "alert" | "promo" | "visit"
    ) => {
      if (!currentChatId || !currentUserId) {
        console.error("Missing currentChatId or currentUserId");
        return;
      }

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
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [currentChatId, currentUserId, dispatch]
  );

  /**
   * Handles the creation of a new chat.
   *
   * @param participants - Array of participant user IDs.
   * @param chatType - Type of chat: "simple", "group", or "broadcast".
   * @param name - Optional name for the chat.
   * @param description - Optional description for the chat.
   * @param admins - Optional array of admin user IDs (only for "group" and "broadcast" chats).
   */
  const handleCreateChat = useCallback(
    async (
      participants: string[],
      chatType: "simple" | "group" | "broadcast",
      name?: string,
      description?: string,
      admins?: string[] // New optional admins parameter
    ) => {
      if (!participants.length) return;

      /*  console.log("Create chat:", {
        participants,
        chatType,
        name,
        description,
        admins, // Log admins if provided
      }); */

      const localId = generateId();

      const chatData: IChat = {
        local_id: localId,
        type: chatType,
        participants,
        name,
        description,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "pending", // Indicate that the chat is pending confirmation
        admins: admins || [], // Assign the admins array directly
      };

      /*       console.log("Dispatching to addChatReducer:", chatData);
       */
      try {
        dispatch(addChatReducer({ chat: chatData }));
      } catch (error) {
        console.error("Failed to create chat:", error);
      }
    },
    [dispatch]
  );

  const handleEditChat = useCallback(
    async (
      chatId: string,
      updatedData: Partial<{
        name: string;
        participants: string[];
        admins: string[];
        updatedAt: Date;
      }>
    ) => {
      if (!chatId) return;

      try {
        const existingChat = chats.find((u) => u._id === chatId);

        if (!existingChat) {
          throw new Error("Chat not found");
        }

        const updatedChat: IChat = {
          ...existingChat,
          ...updatedData,
        };

        // Dispatch an action to update the chat in the store
        dispatch(updateChatReducer({ chatId: updatedChat._id!, updatedData: updatedChat })); // Ensure you have an updateChatReducer
      } catch (error) {
        console.error("Failed to edit chat:", error);
        throw error; // Re-throw to handle in the form
      }
    },
    [dispatch, chats]
  );

  // Handle selecting a contact to open or create a chat
  const handleContactSelect = useCallback(
    (contactId: string) => {
      // Check if there's an existing chat with this contact
      const existingChat = Object.values(chats).find(
        (chat) =>
          chat.type === "simple" &&
          chat.participants.includes(contactId) &&
          chat.participants.includes(currentUserId)
      );

      if (existingChat) {
        // If chat exists, select it
        selectChat(existingChat);
      } else {
        // If no chat exists, create a new one optimistically
        const localId = generateId();

        const newChat: IChat = {
          local_id: localId,
          type: "simple",
          participants: [currentUserId, contactId],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "pending", // Indicate that the chat is pending confirmation
        };

        // Optimistically add the new chat to the state
        dispatch(addChatReducer({ chat: newChat }));

        // Immediately select the new optimistic chat
        selectChat(newChat);
      }
    },
    [chats, currentUserId, dispatch, selectChat]
  );

  const filteredContacts = useMemo(() => {
    // Filter contacts based on the user role and exclude the current user
    if (userRole === "admin") {
      // Admin sees all users except themselves
      return users.filter((user) => user._id !== currentUserId);
    } else if (userRole === "agent") {
      // Agent sees other agents, admins, and their assigned clients, excluding themselves
      return (
        users.filter(
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
        users.filter(
          (user) =>
            user._id !== currentUserId && // Exclude the current user
            (user.role === "admin" || user.role === "agent")
        ) || []
      );
    }

    // Default return if no contacts are found
    /* console.log(
      "User role not recognized or no contacts found. Returning empty array."
    ); */
    return [];
  }, [users, userRole, agentClientIds, currentUserId]); // Dependencies array

  // Filter and sort chats based on search term and message timestamp
  const getFilteredAndSortedChats = useCallback(
    (searchTerm: string) => {
      const sanitizedTerm = sanitizeSearchTerm(searchTerm);

      // Filter chats based on search term
      const filteredChats = sanitizedTerm
        ? chats.filter((chat) =>
            chat.messages.some((message) =>
              sanitizeSearchTerm(message.content).includes(sanitizedTerm)
            )
          )
        : chats;

      // Sort chats by the timestamp of the latest message
      return [...filteredChats].sort((a, b) => {
        const lastMessageA = a.messages[a.messages.length - 1];
        const lastMessageB = b.messages[b.messages.length - 1];
        if (!lastMessageA || !lastMessageB) return 0;
        return (
          new Date(lastMessageB.timestamp).getTime() -
          new Date(lastMessageA.timestamp).getTime()
        );
      });
    },
    [chats]
  );

  // Get the title of the chat based on its type and participants
  const getChatTitle = useCallback(
    (chat: IChat) => {
      if (chat.type === "simple" && chat.participants) {
        const participantId = chat.participants.find(
          (id) => id !== currentUserId
        );
        if (participantId) {
          // Find the participant in the users array
          const participant = users.find((user) => user._id === participantId);
          return participant?.entityName || "Chat";
        }
      }
      return chat.name || "Group Chat";
    },
    [currentUserId, users]
  );

  // Function to get unread messages count
  const getUnreadCount = useCallback(
    (chat: IChat) => {
      if (!currentUserId) return 0;
      return chat.messages.filter(
        (message) =>
          !message.readBy.includes(currentUserId) &&
          message.sender !== currentUserId
      ).length;
    },
    [currentUserId]
  );
  // Function to handle returning to the sidebar on mobile
  const handleBackToChats = () => {
    dispatch(clearCurrentChatReducer()); // Clear currentChat to navigate back to sidebar
  };

  // New function to get unread chats, sorted by the latest message timestamp
  const getUnreadChats = useCallback(() => {
    const unreadChats = chats.filter((chat) => getUnreadCount(chat) > 0);

    // Sort chats by the timestamp of the latest message
    return [...unreadChats].sort((a, b) => {
      const lastMessageA = a.messages[a.messages.length - 1];
      const lastMessageB = b.messages[b.messages.length - 1];
      if (!lastMessageA || !lastMessageB) return 0;
      return (
        new Date(lastMessageB.timestamp).getTime() -
        new Date(lastMessageA.timestamp).getTime()
      );
    });
  }, [chats, getUnreadCount]);

  // Function to select a chat and update the currentChat state
  const handleSelectChat = (chatId: string) => {
    const selectedChat = chats.find((chat) => chat._id === chatId);
    if (selectedChat) {
      selectChat(selectedChat); // Pass the entire chat object to the state
    }
  };

  const broadcastChatId = "6701f7dbc1a80a3d029808ab"; // Your broadcast chat ID

  // Selector to get the broadcast chat
  const broadcastChat = useMemo(() => {
    return chats.find((chat) => chat._id === broadcastChatId) || null;
  }, [chats, broadcastChatId]);

  // Selector to get broadcast messages
  const employeeWhiteboardBroadcast = useMemo(() => {
    return broadcastChat ? broadcastChat.messages : [];
  }, [broadcastChat]);
  useEffect(() => {
    if (chatError) {
      showToast.error(t("chats.error", { error: chatError }));
    }
  }, [chatError, t]);

  return {
    chats: Object.values(chats),
    loadingChats,
    chatError,
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
    getFilteredAndSortedChats,
    getChatTitle,
    getUnreadCount,
    handleBackToChats,
    getUnreadChats,
    handleSelectChat,
    employeeWhiteboardBroadcast,
    broadcastChat,
    markMessagesAsRead,
    handleEditChat,
  };
};

export default useChatLogic;
