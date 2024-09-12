import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hooks";
import { selectUserId, selectUserRole } from "../features/auth/authSlice";
import {
  addMessageReducer,
  fetchAllChatsThunk,
  fetchMessagesThunk,
  selectAllChats,
  selectCurrentChat,
  selectMessagesFromCurrentChat,
  setCurrentChatReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice"; // Ensure correct selectors are imported
import { selectClientIds } from "../features/data/dataSlice";
import { getAllUsersThunk, selectAllUsers } from "../features/users/userSlice";
import { IChat, IMessage } from "../models/dataModels";
import { webSocketService } from "../services/webSocketService";
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
  const [page, setPage] = useState(2); // Start from page 2 since page 1 is already loaded

  const agentClientIds = useSelector(selectClientIds);

  // Fetch chats with retry mechanism
  useEffect(() => {
    const fetchChats = async () => {
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
    };

    // Call fetchChats initially
    fetchChats();
  }, [dispatch, chatRetryCount]);

  // Retry mechanism
  useEffect(() => {
    if (chatRetryCount > 0 && chatRetryCount <= 5) {
      const retryTimeout = setTimeout(() => {
        console.log(`Retry attempt #${chatRetryCount}`);
        dispatch(fetchAllChatsThunk()); // Retry fetching chats
      }, 5000); // Retry after 5 seconds

      return () => {
        clearTimeout(retryTimeout); // Cleanup timeout on unmount or retryCount change
      };
    }
  }, [chatRetryCount, dispatch]);

  // Select a chat
  const selectChat = useCallback(
    (chat: IChat) => {
      dispatch(setCurrentChatReducer(chat)); // Set current chat in the state

      // Update read status using existing messages, no need to fetch them again
      const unreadMessageIds = chat.messages
        .filter(
          (message: IMessage) =>
            !message.readBy.includes(currentUserId) &&
            message.sender !== currentUserId
        )
        .map((message) => message.local_id || message._id);

      // Update read status for unread messages
      if (unreadMessageIds.length > 0) {
        dispatch(
          updateReadStatusReducer({
            chatId: chat._id,
            userId: currentUserId,
            messageIds: unreadMessageIds,
          })
        );
      }
    },
    [currentUserId, dispatch]
  );

 // Debounced fetch handler to avoid multiple requests
const handleLoadMoreMessages = debounce(() => {
  if (currentChat?._id) {
    console.log(`Fetching more messages for chat: ${currentChat._id}`); // Debug: Log chat ID
    console.log(`Current page: ${page}, limit: 20`); // Debug: Log the current page and limit

    // Dispatch the fetchMessagesThunk to load more messages, incrementing the page
    dispatch(
      fetchMessagesThunk({
        chatId: currentChat._id,
        page: page, // Use the current page
        limit: 100, // Adjust the limit as needed
      })
    )
      .unwrap()
      .then(() => {
        console.log(`Fetched messages successfully for page: ${page}`); // Debug: Log success for current page
        setPage((prevPage) => {
          console.log(`Incrementing page to: ${prevPage + 1}`); // Debug: Log next page number
          return prevPage + 1; // Increment page on successful fetch
        });
      })
      .catch((error) => {
        console.error("Error loading more messages:", error); // Debug: Log any errors during fetch
      });
  } else {
    console.log("No current chat selected, skipping message fetch."); // Debug: Log when no chat is selected
  }
}, 50);


  // Fetch contacts when needed
  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      await dispatch(getAllUsersThunk()).unwrap();
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Send a new message in the current chat
  const handleSendMessage = useCallback(
    async (
      content: string,
      messageType: "message" | "alert" | "promo" | "visit"
    ) => {
      if (!currentChat?._id || !currentUserId) {
        console.error("Missing currentChat or currentUserId:", {
          currentChatId: currentChat?._id,
          currentUserId,
        });
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
          addMessageReducer({ chatId: currentChat._id, message: messageData })
        );
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [currentChat, currentUserId, dispatch]
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
      // Alternatively, if using thunks directly:
      // const createdChat = await dispatch(createChatThunk(chatData)).unwrap();
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
      selectChat(existingChat);
    } else {
      // If no chat exists, create a new one
      handleCreateChat([currentUserId, contactId], "simple");
    }
  };

  const filteredContacts = useMemo(() => {
    // Log the current user ID for reference
    /*     console.log("Current User ID:", currentUserId);
     */
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
    console.log(
      "User role not recognized or no contacts found. Returning empty array."
    );
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
        (message) => !message.readBy.includes(currentUserId)
      ).length;
    },
    [currentUserId]
  );

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
    handleLoadMoreMessages,
  };
};

export default useChatLogic;
