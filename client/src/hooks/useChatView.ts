// useChatView.ts
import { useMemo, useState } from "react";
import { useAppSelector } from "../app/hooks";

const useChatView = () => {
  // First, get the currentChatId from the currentChat state
  const currentChatId = useAppSelector((state) => state.chats.currentChat?._id);

  // Get the correct chat from the chats state
  const currentChat = useAppSelector((state) =>
    currentChatId ? state.chats.chats[currentChatId] : null
  );

  // Sort messages by timestamp before rendering
  const sortedMessages = useMemo(() => {
    return currentChat?.messages
      ? [...currentChat.messages].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      : [];
  }, [currentChat?.messages]);

  const currentUserId = useAppSelector((state) => state.auth.userId);
  const users = useAppSelector((state) => state.users.users);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  // Handler for opening the options menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handler for closing the options menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Get participants data by mapping the user IDs in currentChat to user details
  const participantsData =
    currentChat?.participants.map((participantId) => users[participantId]) ||
    [];

  // Define mock options based on chat type and user role
  const getChatOptions = () => {
    if (!currentChat) return [];

    if (currentChat.type === "group" && currentChat.admins?.includes(currentUserId)) {
      return [
        "mute",
        "edit_group",
        "edit_group_member",
        "delete_chat",
        "archive_chat",
      ];
    } else if (currentChat.type === "group") {
      return ["mute", "archive_chat"];
    } else if (
      currentChat.type === "broadcast" &&
      currentChat.admins?.includes(currentUserId)
    ) {
      return [
        "mute",
        "edit_broadcast_name",
        "edit_broadcast_members",
        "delete_broadcast",
        "archive_chat",
      ];
    } else if (currentChat.type === "broadcast") {
      return ["mute", "archive_chat"];
    } else {
      return ["mute", "archive_chat"];
    }
  };

  // Determine the chat title and admin avatar based on chat type
  const getChatTitle = () => {
    if (!currentChat) return "Chat";

    if (currentChat.type === "simple" && currentChat.participants) {
      const participantId = currentChat.participants.find(
        (id) => id !== currentUserId
      );
      if (participantId !== undefined) {
        const participant = users[participantId];
        return participant?.entityName || "Chat";
      }
    }
    return currentChat?.name || "Group Chat";
  };

  const getAdminAvatar = () => {
    if (
      currentChat &&
      currentChat.type !== "simple" &&
      currentChat.admins?.length
    ) {
      const admin = users[currentChat.admins[0]];
      return admin?.avatar;
    }
    return null;
  };

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
