// useLoadOlderMessages.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchOlderMessagesThunk } from "../features/chat/chatThunks";

const useLoadOlderMessages = (currentChatId: string | null) => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) =>
    currentChatId ? state.chats.chats[currentChatId]?.messages || [] : []
  );
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const currentUserId = useAppSelector((state) => state.auth.userId);

  // Ref to track initial load
  const initialLoadRef = useRef(true);

  useEffect(() => {
    setHasMoreMessages(true);
    initialLoadRef.current = true; // Reset initial load for new chat
  }, [currentChatId]);

  // Scroll to bottom when chat changes
  // Scroll to bottom when chat changes
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [currentChatId]);

  // Scroll to bottom when new message is sent or received

  const prevMessagesLength = useRef(messages.length);

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

  const oldestMessage = useMemo(() => messages[0], [messages]);

  const handleLoadOlderMessages = useCallback(async () => {
    if (!currentChatId || loading || !hasMoreMessages) return;

    const container = messagesContainerRef.current;
    if (container) {
      const scrollHeightBeforeFetch = container.scrollHeight;
      const scrollTopBeforeFetch = container.scrollTop;

      const oldestTimestamp = new Date(oldestMessage.timestamp);

      setLoading(true);
      try {
        const fetchedMessages = await dispatch(
          fetchOlderMessagesThunk({
            chatId: currentChatId,
            oldestTimestamp,
            limit: 25,
          })
        ).unwrap();

        if (fetchedMessages.messages.length === 0) {
          setHasMoreMessages(false);
        }

        // Adjust scrollTop to maintain scroll position using requestAnimationFrame
        requestAnimationFrame(() => {
          const container = messagesContainerRef.current;
          if (container) {
            const scrollHeightAfterFetch = container.scrollHeight;
            container.scrollTop =
              scrollTopBeforeFetch +
              (scrollHeightAfterFetch - scrollHeightBeforeFetch);
          }
        });
      } finally {
        setLoading(false);
      }
    }
  }, [
    currentChatId,
    loading,
    hasMoreMessages,
    oldestMessage.timestamp,
    dispatch,
  ]);

  // Use useInView to detect when the top element is in view
  const { ref: topRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px', // Adjust as needed
  });
  // Load older messages when the top element comes into view
  useEffect(() => {
    if (inView && hasMoreMessages && !loading) {
      handleLoadOlderMessages();
    }
  }, [inView, hasMoreMessages, loading, handleLoadOlderMessages]);

  return { messagesContainerRef, topRef };
};

export default useLoadOlderMessages;
