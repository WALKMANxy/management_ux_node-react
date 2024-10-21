// src/hooks/useChatView.ts
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../app/hooks";
import { showToast } from "../services/toastMessage";
import { selectCurrentChat } from "../features/chat/chatSlice";

const useChatView = () => {
  const { t } = useTranslation(); // Initialize translation
  const [error, setError] = useState<string | null>(null);

  const currentChat = useAppSelector(selectCurrentChat)
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const users = useAppSelector((state) => state.users.users);

  // Error Handling: Display toast when an error occurs
  useEffect(() => {
    if (error) {
      showToast.error(error);
      setError(null); // Reset error after displaying
    }
  }, [error]);

  const sortedMessages = useMemo(() => {
    return currentChat?.messages || [];
  }, [currentChat?.messages]);


/*   useEffect(() => {
    console.log("Sorted messaged:", sortedMessages);
  }, [sortedMessages]); */

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  // Handlers for menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Determine the chat title and admin avatar based on chat type
  // Chat Title
  const getChatTitle = useMemo(() => {
    if (!currentChat) return t("chat.defaultTitle");

    if (currentChat.type === "simple" && currentChat.participants) {
      const participantId = currentChat.participants.find(
        (id) => id !== currentUserId
      );
      if (participantId) {
        const participant = users[participantId];
        return participant?.entityName || t("chat.deletedUser");
      }
    }
    return currentChat?.name || t("chat.groupTitle");
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

  return {
    currentChat,
    sortedMessages,
    menuAnchorEl,
    isMenuOpen,
    handleMenuOpen,
    handleMenuClose,
    getChatOptions,
    getChatTitle,
    getAdminAvatar,
    participantsData,
    currentUserId,
  };
};

export default useChatView;
