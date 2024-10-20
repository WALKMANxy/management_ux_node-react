import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useAppDispatch /* useAppSelector */,
  useAppSelector,
} from "../app/hooks";
import { selectUserId, selectUserRole } from "../features/auth/authSlice";
import { uploadAttachments } from "../features/chat/api/chats";
import {
  addAttachmentMessageReducer,
  addChatReducer,
  addMessageReducer,
  clearCurrentChatReducer,
  selectAllChats,
  selectChatsStatus,
  selectCurrentChat,
  selectMessagesFromCurrentChat,
  setCurrentChatReducer,
  updateChatReducer,
  updateReadStatusReducer,
} from "../features/chat/chatSlice"; // Ensure correct selectors are imported
import { fetchAllChatsThunk } from "../features/chat/chatThunks";
import { selectClientIds } from "../features/data/dataSlice";
import { getAllUsersThunk, selectAllUsers } from "../features/users/userSlice";
import { Attachment, IChat, IMessage } from "../models/dataModels";
import { sanitizeSearchTerm } from "../utils/chatUtils";
import { generateId } from "../utils/deviceUtils";

const useChatLogic = () => {
  const dispatch = useAppDispatch();
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Selectors
  const currentUserId = useAppSelector(selectUserId);
  const userRole = useAppSelector(selectUserRole);
  const users = useAppSelector(selectAllUsers);
  const chats: IChat[] = useAppSelector(selectAllChats); // Use selector to get all chats
  const currentChat: IChat | null = useSelector(selectCurrentChat); // Allow null values
  const messages = useAppSelector(selectMessagesFromCurrentChat); // Use selector to get messages of the current chat
  const [contactsFetched, setContactsFetched] = useState(false);
  const { t } = useTranslation();
  const chatStatus = useAppSelector(selectChatsStatus);
  const agentClientIds = useSelector(selectClientIds);
  const currentChatId = currentChat?._id;
  const chatRetryCountRef = useRef(0);

  // Determine if chats should be fetched
  const shouldFetchChats = useMemo(() => {
    return chatStatus !== "succeeded";
  }, [chatStatus]);

  const fetchChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      await dispatch(fetchAllChatsThunk()).unwrap();
      setChatError(null);
      chatRetryCountRef.current = 0; // Reset retry count on success
    } catch (err: unknown) {
      console.error("Error fetching chats:", err);
      if (err instanceof Error) {
        setChatError(err.message);
      } else {
        setChatError("An unknown error occurred while fetching chats.");
      }
      // Increment retry count only if it's less than the limit
      if (chatRetryCountRef.current < 5) {
        chatRetryCountRef.current += 1;
      }
    } finally {
      setLoadingChats(false);
    }
  }, [dispatch]);

  // Initial fetch effect
  useEffect(() => {
    if (shouldFetchChats) {
      const timeoutId = setTimeout(() => {
        // Call fetchChats after a 500ms delay
        fetchChats();
      }, 500);

      // Cleanup function to clear timeout if the component unmounts or dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [shouldFetchChats, fetchChats]);

  // Retry mechanism
  useEffect(() => {
    if (
      chatRetryCountRef.current > 0 &&
      chatRetryCountRef.current <= 5 &&
      chatStatus !== "succeeded"
    ) {
      const retryDelay = Math.min(32000, 1000 * 2 ** chatRetryCountRef.current); // Exponential backoff

      const retryTimeout = setTimeout(() => {
        console.log(`Retry attempt #${chatRetryCountRef.current}`);
        fetchChats();
      }, retryDelay);

      return () => {
        clearTimeout(retryTimeout);
      };
    }
  }, [fetchChats, chatStatus]);

  // Select a chat
  const selectChat = useCallback(
    (chat: IChat) => {
      // Determine the chat identifier: use _id if available, otherwise local_id
      const chatId = chat._id || chat.local_id;

      if (!chatId) {
        console.warn("Chat does not have an _id or local_id:", chat);
        return;
      }

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
      messageType: "message" | "alert" | "promo" | "visit",
      attachments?: Attachment[]
    ) => {
      if (!currentChatId || !currentUserId) {
        console.error("Missing currentChatId or currentUserId");
        return;
      }

      const localId = generateId();

      // Failsafe for empty content when attachments exist
      const finalContent =
        content.trim() === "" && attachments && attachments.length > 0
          ? "📌"
          : content;

      const messageData: IMessage = {
        _id: localId,
        local_id: localId,
        content: finalContent,
        sender: currentUserId,
        timestamp: new Date(),
        readBy: [currentUserId],
        messageType,
        attachments: attachments || [],
        status: "pending",
      };

      const hasAttachments = attachments && attachments.length > 0;

      try {
        if (hasAttachments) {
          const updatedAttachments = attachments.map((attachment) => ({
            ...attachment,
            chatId: currentChatId,
            messageId: localId,
          }));
          messageData.attachments = updatedAttachments;

          console.log(
            `Dispatching addAttachmentMessageReducer for message with attachments: ${messageData._id}`
          );

          // Dispatch message with attachments
          dispatch(
            addAttachmentMessageReducer({
              chatId: currentChatId,
              message: messageData,
            })
          );

          // Initiate the upload with error handling
          await uploadAttachments(currentChatId, messageData, dispatch);
        } else {
          // Dispatch message without attachments
          dispatch(
            addMessageReducer({ chatId: currentChatId, message: messageData })
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [currentChatId, currentUserId, dispatch]
  );

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
        dispatch(
          updateChatReducer({
            chatId: updatedChat._id!,
            updatedData: updatedChat,
          })
        ); // Ensure you have an updateChatReducer
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
      let chatToSelect: IChat | null = null;

      try {
        // Check if there's an existing chat with this contact
        const existingChat = chats.find(
          (chat) =>
            chat.type === "simple" &&
            chat.participants.includes(contactId) &&
            chat.participants.includes(currentUserId)
        );

        if (existingChat) {
          // If chat exists, prepare to select it
          chatToSelect = existingChat;
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

          // Prepare to select the new optimistic chat
          chatToSelect = newChat;
        }
      } catch (error) {
        console.error("handleContactSelect encountered an error:", error);
        // Handle error appropriately (e.g., show a notification to the user)
      } finally {
        if (chatToSelect) {
          selectChat(chatToSelect);
        }
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
    } else if (userRole === "employee") {
      // Employees can see admins and agents, but not clients, and exclude themselves
      return (
        users.filter(
          (user) =>
            user._id !== currentUserId && // Exclude the current user
            (user.role === "admin" || user.role === "agent")
        ) || []
      );
    }

    // Default return if no contacts are found
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
  const handleBackToChats = useCallback(() => {
    dispatch(clearCurrentChatReducer()); // Clear currentChat to navigate back to sidebar
  }, [dispatch]);

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
      console.error(t("chats.error", { error: chatError }));
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
    contactsFetched,
    loadingContacts, // Provide loading state
    filteredContacts, // Function to filter contacts based on the role
    getFilteredAndSortedChats,
    getChatTitle,
    getUnreadCount,
    handleBackToChats,
    getUnreadChats,
    employeeWhiteboardBroadcast,
    broadcastChat,
    markMessagesAsRead,
    handleEditChat,
    handleSelectChat,
  };
};

export default useChatLogic;
