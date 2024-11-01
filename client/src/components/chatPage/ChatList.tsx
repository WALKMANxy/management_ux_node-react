// src/components/chatPage/ChatList.tsx
import {
  Avatar,
  Badge,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import useChatLogic from "../../hooks/useChatsLogic";
import { formatDateChats } from "../../utils/chatUtils";

interface ChatListProps {
  searchTerm?: string;
  loading?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
  searchTerm = "",
  loading = false,
}) => {
  /*   console.log("ChatView rendering now");
   */

  const { t } = useTranslation();
  const {
    getFilteredAndSortedChats,
    getChatTitle,
    getUnreadCount,
    selectChat,
  } = useChatLogic();

  // Retrieve sorted and filtered chats based on the search term
  const sortedChats = getFilteredAndSortedChats(searchTerm);

  return (
    <List>
      {loading ? (
        // Display skeletons while loading chats
        Array.from({ length: 5 }).map((_, index) => (
          <ListItem key={index}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="80%" sx={{ ml: 2 }} />
          </ListItem>
        ))
      ) : sortedChats.length > 0 ? (
        // Display list of chats
        sortedChats.map((chat) => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          const lastMessagePreview = lastMessage
            ? lastMessage.content.slice(0, 20)
            : t("chatList.noMessages");

          const title = getChatTitle(chat);
          const avatarLetter = title.charAt(0).toUpperCase();
          const avatar = <Avatar>{avatarLetter}</Avatar>;
          const unreadCount = getUnreadCount(chat);
          const isNew = unreadCount > 0;

          return (
            <ListItem
              key={chat._id || chat.local_id}
              button
              onClick={() => {
                selectChat(chat);
              }}
              sx={{ borderBottom: "1px solid #e0e0e0" }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={unreadCount}
                  color="secondary"
                  invisible={!isNew}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  {avatar}
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={title}
                secondary={lastMessagePreview}
                secondaryTypographyProps={{ color: "textSecondary" }}
              />
              {lastMessage && (
                <Box sx={{ ml: 2, textAlign: "right" }}>
                  <Typography variant="caption" color="textSecondary">
                    {lastMessage.timestamp
                      ? formatDateChats(lastMessage.timestamp)
                      : t("chatList.na")}
                  </Typography>
                </Box>
              )}
            </ListItem>
          );
        })
      ) : (
        // Display message when no chats are found
        <Box textAlign="center" p={2}>
          <Typography variant="body1" color="textSecondary">
            {t("chatList.noChatsFound")}
          </Typography>
        </Box>
      )}
    </List>
  );
};

export default React.memo(ChatList);
