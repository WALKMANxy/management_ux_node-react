/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useUnifiedChat.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectCurrentChat } from "../features/chat/chatSlice";
import { fetchOlderMessagesThunk } from "../features/chat/chatThunks";
import { showToast } from "../services/toastMessage";

const useChatRender = () => {
  // Translation
  const { t } = useTranslation();

  // Redux Dispatch and Selectors
  const dispatch = useAppDispatch();
  const currentChat = useAppSelector(selectCurrentChat);
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const users = useAppSelector((state) => state.users.users);

  // Messages and Loading States
  const messages = useMemo(
    () => currentChat?.messages || [],
    [currentChat?.messages]
  );
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Error Handling
  const [error, setError] = useState<string | null>(null);

  // Menu State
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  // Ref to track initial load
  const initialLoadRef = useRef(true);

  // Effect: Reset states when currentChat changes
  useEffect(() => {
    setHasMoreMessages(true);
    initialLoadRef.current = true;
    // Scroll to bottom on new chat
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [currentChat?._id]);

  // Ref to track previous messages length
  const prevMessagesLength = useRef(messages.length);

  // Effect: Scroll to bottom when new messages arrive
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (messages.length > prevMessagesLength.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === currentUserId) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      } else {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = scrollHeight - (scrollTop + clientHeight) <= 100;

        if (isAtBottom) {
          requestAnimationFrame(() => {
            container.scrollTop = scrollHeight;
          });
        }
      }
    }

    prevMessagesLength.current = messages.length;
  }, [messages, currentUserId]);

  // Oldest Message
  const oldestMessage = useMemo(() => messages[0] || null, [messages]);

  // Load Older Messages Handler
  const handleLoadOlderMessages = useCallback(async () => {
    if (
      !currentChat?._id ||
      loading ||
      !hasMoreMessages ||
      !oldestMessage ||
      messages.length <= 20
    )
      return;

    const container = messagesContainerRef.current;
    if (container) {
      const scrollHeightBeforeFetch = container.scrollHeight;
      const scrollTopBeforeFetch = container.scrollTop;

      const oldestTimestamp = oldestMessage
        ? new Date(oldestMessage.timestamp)
        : new Date();

      setLoading(true);
      try {
        const fetchedMessages = await dispatch(
          fetchOlderMessagesThunk({
            chatId: currentChat._id,
            oldestTimestamp,
            limit: 25,
          })
        ).unwrap();

        if (fetchedMessages.messages.length === 0) {
          setHasMoreMessages(false);
        }

        // Adjust scrollTop to maintain scroll position
        requestAnimationFrame(() => {
          const container = messagesContainerRef.current;
          if (container) {
            const scrollHeightAfterFetch = container.scrollHeight;
            container.scrollTop =
              scrollTopBeforeFetch +
              (scrollHeightAfterFetch - scrollHeightBeforeFetch);
          }
        });
      } catch (err: any) {
        setError(err.message || t("errors.unknown"));
      } finally {
        setLoading(false);
      }
    }
  }, [
    currentChat?._id,
    loading,
    hasMoreMessages,
    dispatch,
    oldestMessage,
    messages.length,
    t,
  ]);

  // Intersection Observer to load older messages
  const { ref: topRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasMoreMessages && !loading && oldestMessage) {
      handleLoadOlderMessages();
    }
  }, [
    inView,
    hasMoreMessages,
    loading,
    handleLoadOlderMessages,
    oldestMessage,
  ]);

  // Error Handling: Display toast
  useEffect(() => {
    if (error) {
      showToast.error(error);
      setError(null);
    }
  }, [error]);

  // Participants Data
  const participantsData = useMemo(() => {
    if (!currentChat) return [];
    try {
      return currentChat.participants.map((participantId) => {
        const user = users[participantId];
        if (!user) {
          throw new Error(t("errors.userNotFound", { id: participantId }));
        }
        return user;
      });
    } catch (err: any) {
      setError(err.message || t("errors.unknown"));
      return [];
    }
  }, [currentChat, users, t]);

  // Chat Options
  const getChatOptions = useMemo(() => {
    if (!currentChat) return [];

    const isAdmin = currentChat.admins?.includes(currentUserId);
    const baseOptions = ["mute", "archive_chat"];

    if (currentChat.type === "group") {
      return isAdmin
        ? ["edit_group", "delete_chat", ...baseOptions]
        : baseOptions;
    }

    if (currentChat.type === "broadcast") {
      return isAdmin
        ? ["edit_broadcast", "delete_broadcast", ...baseOptions]
        : baseOptions;
    }

    return baseOptions;
  }, [currentChat, currentUserId]);

  // Chat Title
  const getChatTitle = useMemo(() => {
    if (!currentChat) return t("chats.defaultTitle");

    if (currentChat.type === "simple" && currentChat.participants) {
      const participantId = currentChat.participants.find(
        (id) => id !== currentUserId
      );
      if (participantId) {
        const participant = users[participantId];
        return participant?.entityName || t("chats.deletedUser");
      }
    }
    return currentChat?.name || t("chats.groupTitle");
  }, [currentChat, currentUserId, users, t]);

  // Admin Avatar
  const getAdminAvatar = useMemo(() => {
    if (
      currentChat &&
      currentChat.type !== "simple" &&
      currentChat.admins?.length
    ) {
      const admin = users[currentChat.admins[0]];
      if (!admin) {
        setError(t("errors.adminNotFound", { id: currentChat.admins[0] }));
        return null;
      }
      return admin.avatar;
    }
    return null;
  }, [currentChat, users, t]);

  // Menu Handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return {
    // References
    messagesContainerRef,
    topRef,

    // Messages and Loading
    messages,
    loading,
    hasMoreMessages,

    // Chat Data
    currentChat,
    sortedMessages: messages, // Alias for compatibility
    participantsData,
    currentUserId,

    // Menu State and Handlers
    menuAnchorEl,
    isMenuOpen,
    handleMenuOpen,
    handleMenuClose,

    // Chat Options and Metadata
    getChatOptions,
    getChatTitle,
    getAdminAvatar,
  };
};

export default useChatRender;
