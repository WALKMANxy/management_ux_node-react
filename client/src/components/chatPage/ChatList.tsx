//src/components/chatPage/ChatList.tsx
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
import useChatLogic from "../../hooks/useChatsLogic";
import { formatDate } from "../../utils/chatUtils";

interface ChatListProps {
  searchTerm?: string; // Make searchTerm optional
  loading: boolean; // Loading state prop
}

const ChatList: React.FC<ChatListProps> = ({ searchTerm = "" }) => {
  const {
    getFilteredAndSortedChats,
    getChatTitle,
    getUnreadCount,
    selectChat,
    loadingChats,
  } = useChatLogic(); // Destructure the required functions from the hook  const currentUserId = useAppSelector((state: RootState) => state.auth.userId);

  const sortedChats = getFilteredAndSortedChats(searchTerm);

  console.log("ChatList rendering now")

  return (
    <List>
      {loadingChats ? (
        Array.from({ length: 5 }).map((_, index) => (
          <ListItem key={index}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="80%" sx={{ ml: 2 }} />
          </ListItem>
        ))
      ) : sortedChats.length > 0 ? (
        sortedChats.map((chat) => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          const lastMessagePreview = lastMessage
            ? lastMessage.content.slice(0, 20)
            : "No messages";

          const title = getChatTitle(chat);
          const avatar = <Avatar>{title.charAt(0)}</Avatar>;
          const unreadCount = getUnreadCount(chat);
          const isNew = unreadCount > 0;

          return (
            <ListItem
              className={`animate__animated ${isNew ? "animate__bounce" : ""}`}
              button
              key={chat._id}
              onClick={() => {
                console.log("Chat selected with ID:", chat._id); // Debug: Check if the click event fires with the correct chat ID
                selectChat(chat); // Call selectChat to update the current chat state
              }}
              sx={{ borderBottom: "1px solid #e0e0e0" }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={unreadCount}
                  color="secondary"
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
                    {formatDate(lastMessage.timestamp)}
                  </Typography>
                </Box>
              )}
            </ListItem>
          );
        })
      ) : (
        <Box textAlign="center" p={2}>
          <Typography variant="body1" color="textSecondary">
            No chats found.
          </Typography>
        </Box>
      )}
    </List>
  );
};

export default ChatList;
