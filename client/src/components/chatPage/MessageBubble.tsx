// MessageBubble.tsx
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Avatar, Box, Typography } from "@mui/material";
import React from "react";
import { IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";

interface MessageBubbleProps {
  message: IMessage;
  participantsData: Partial<User>[]; // Array of participants data passed from ChatView
  chatType: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  participantsData,
  chatType,
}) => {
  const currentUserId = localStorage.getItem("currentUserId");
  const isOwnMessage = message.sender === currentUserId;

  // Find the sender's details from the participants data
  const sender = participantsData.find((user) => user._id === message.sender);
  const senderAvatar = sender?.avatar || ""; // Fallback to empty string if no avatar

  // Determine if the message is read by all participants (relevant for group chats)
  const isGroupRead = message.readBy.length === participantsData.length;

  // Determine if the message is read by the other participant in a simple chat
  const isSimpleChatRead =
    chatType === "simple" &&
    message.readBy.includes(
      participantsData.find((user) => user._id !== currentUserId)?._id || ""
    );

  const getMessageStatusIcon = () => {
    if (message.status === "pending")
      return <DoneIcon sx={{ color: "gray" }} />;
    if (message.status === "sent")
      return <DoneAllIcon sx={{ color: "gray" }} />;
    if (chatType === "simple" && isSimpleChatRead)
      return <DoneAllIcon sx={{ color: "turquoise" }} />;
    if (chatType !== "simple" && isGroupRead)
      return <DoneAllIcon sx={{ color: "turquoise" }} />;
    return null;
  };

  const getBackgroundColor = () => {
    switch (message.messageType) {
      case "alert":
        return "rgba(255, 0, 0, 0.1)";
      case "promo":
        return "rgba(0, 255, 0, 0.1)";
      case "visit":
        return "rgba(255, 165, 0, 0.1)";
      default:
        return isOwnMessage ? "rgba(0, 123, 255, 0.1)" : "#ffffff";
    }
  };

  return (
    <Box
      className="animate__animated animate__fadeInUp animate__faster"
      sx={{
        display: "flex",
        flexDirection: isOwnMessage ? "row-reverse" : "row",
        mb: 2,
        alignItems: "flex-end",
      }}
    >
      {/* Show sender avatar only if the message is not from the current user */}
      {!isOwnMessage && <Avatar src={senderAvatar} sx={{ mr: 2 }} />}

      {/* Message Bubble */}
      <Box
        sx={{
          maxWidth: "60%",
          p: 1.5,
          bgcolor: getBackgroundColor(),
          color: isOwnMessage ? "#000000" : "#000000",
          borderRadius: 2,
          position: "relative",
        }}
      >
        <Typography variant="body2">{message.content}</Typography>

        {/* Timestamp and Status Icon */}
        <Typography
          variant="caption"
          sx={{
            color: "gray",
            display: "flex",
            alignItems: "center",
            mt: 0.5,
            justifyContent: isOwnMessage ? "flex-end" : "flex-start",
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isOwnMessage && getMessageStatusIcon()}
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageBubble;
