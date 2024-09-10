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
import dayjs from "dayjs";
import React from "react";
import { IChat } from "../../models/dataModels";

interface ChatListProps {
  chats: IChat[];
  searchTerm?: string; // Make searchTerm optional
  selectChat: (chatId: string) => void;
  loading: boolean; // Loading state prop
}

// Utility to sanitize the search term
const sanitizeSearchTerm = (term: string) =>
  term.replace(/[^\w\s]/gi, "").toLowerCase();

const ChatList: React.FC<ChatListProps> = ({
  chats,
  searchTerm = "", // Default searchTerm to an empty string if not provided
  selectChat,
  loading,
}) => {
  const sanitizedTerm = sanitizeSearchTerm(searchTerm);

  // Format date for the chat preview
  const formatDate = (date: Date) => {
    const dayDifference = dayjs().diff(dayjs(date), "day");
    if (dayDifference === 0) {
      return dayjs(date).format("hh:mm A");
    } else if (dayDifference === 1) {
      return "Yesterday";
    } else {
      return dayjs(date).format("MMM D");
    }
  };

  // Corrected getUnreadCount function
  const getUnreadCount = (chat: IChat) => {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) return 0;
    return chat.messages.filter(
      (message) => !message.readBy.includes(currentUserId)
    ).length;
  };

  // Filter chats based on search term
  const filteredChats = searchTerm
    ? chats.filter((chat) =>
        chat.messages.some((message) =>
          sanitizeSearchTerm(message.content).includes(sanitizedTerm)
        )
      )
    : chats;

  // Sort chats by the timestamp of the latest message
  const sortedChats = [...filteredChats].sort((a, b) => {
    const lastMessageA = a.messages[a.messages.length - 1];
    const lastMessageB = b.messages[b.messages.length - 1];

    if (!lastMessageA || !lastMessageB) return 0; // Fallback if messages are missing

    return (
      new Date(lastMessageB.timestamp).getTime() -
      new Date(lastMessageA.timestamp).getTime()
    );
  });

  return (
    <List>
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <ListItem key={index}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="80%" sx={{ ml: 2 }} />
          </ListItem>
        ))
      ) : sortedChats.length > 0 ? (
        sortedChats.map((chat) => {
          // Find a matching message based on the search term
          const matchedMessage = chat.messages.find((message) =>
            sanitizeSearchTerm(message.content).includes(sanitizedTerm)
          );

          // Determine which message preview to show
          const lastMessage = chat.messages[chat.messages.length - 1];
          const lastMessagePreview = matchedMessage
            ? matchedMessage.content.slice(0, 20) // Show matched message preview
            : lastMessage
            ? lastMessage.content.slice(0, 20)
            : "No messages";

          // Determine title, avatar, and unread count for each chat type
          const title = chat.name || "Chat";
          const avatar = <Avatar>{title.charAt(0)}</Avatar>;
          const unreadCount = getUnreadCount(chat);

          // Check if the chat has unread messages
          const isNew = unreadCount > 0;

          return (
            <ListItem
              className={`animate__animated ${isNew ? "animate__bounce" : ""}`}
              button
              key={chat._id}
              onClick={() => {
                console.log("Chat selected with ID:", chat._id); // Debug: Check if the click event fires with the correct chat ID
                selectChat(chat._id);
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
