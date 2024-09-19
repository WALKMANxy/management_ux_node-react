// MessageBubble.tsx
import { Avatar, Box, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { selectCurrentChat } from "../../features/chat/chatSlice";
import { IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";
import "../../Styles/animatecss.css";
import MessageStatusIcon from "./MessageStatusIcon";
interface MessageBubbleProps {
  message: IMessage;
  participantsData: Partial<User>[]; // Array of participants data passed from ChatView
  chatType: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  participantsData = [],
  chatType,
}) => {
  const currentUserId = useAppSelector((state: RootState) => state.auth.userId);
  const isOwnMessage = message.sender === currentUserId;
  const currentChat = useAppSelector(selectCurrentChat);
  const currentChatType = currentChat?.type;

  // Find the sender's details from the participants data
  const sender = participantsData.find((user) => user._id === message.sender);
  const senderAvatar = sender?.avatar || "";

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
    }
  }, []);

  // Conditionally apply animation class based on whether the message is the user's own
  const animationClass = isOwnMessage
    ? hasMountedRef.current
      ? ""
      : "animate__animated animate__fadeInUp"
    : "animate__animated animate__fadeInUp";

  const getBackgroundColor = () => {
    switch (message.messageType) {
      case "alert":
        return "rgba(255, 0, 0, 0.1)";
      case "promo":
        return "rgba(0, 255, 0, 0.1)";
      case "visit":
        return "rgba(255, 165, 0, 0.1)";
      default:
        return isOwnMessage ? "rgba(33,138,255, 0.3)" : "#ffffff";
    }
  };

  return (
    <Box
      className={animationClass}
      sx={{
        display: "flex",
        flexDirection: isOwnMessage ? "row-reverse" : "row", // Control the message direction
        alignItems: "flex-end",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        mb: 1,
        maxWidth: "75%", // Control bubble width without making it float away from its anchor
      }}
    >
      {/* Show sender avatar only if the message is not from the current user and in group chats */}
      {!isOwnMessage && currentChatType === "group" && (
        <Avatar src={senderAvatar} sx={{ width: 32, height: 32, mr: 1 }} />
      )}

      {/* Message Bubble */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: getBackgroundColor(),
          borderRadius: "1em",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
          maxWidth: "100%", // Ensure the bubble doesn’t exceed the parent width
          textAlign: "left", // Align text based on the message direction
        }}
      >
        <Typography
          variant="body2"
          sx={{
            wordBreak: "break-word", // Allows long words to break and wrap to the next line
            overflowWrap: "break-word", // Ensures text wraps within the container
          }}
        >
          {message.content}
        </Typography>

        {/* Timestamp and Status Icon */}
        <Typography
          variant="caption"
          sx={{
            color: "gray",
            display: "flex",
            alignItems: "center",
            mt: 0.5,
            justifyContent: isOwnMessage ? "flex-end" : "flex-start",
            gap: 0.5, // Add margin between timestamp and status icon
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          <MessageStatusIcon
            message={message}
            chatType={chatType}
            participantsData={participantsData}
            isOwnMessage={isOwnMessage}
          />
        </Typography>
      </Box>
    </Box>
  );
};

export default React.memo(MessageBubble, (prevProps, nextProps) => {
  return (
    prevProps.message.readBy.length === nextProps.message.readBy.length &&
    prevProps.message.readBy.every(
      (value, index) => value === nextProps.message.readBy[index]
    ) &&
    prevProps.message.status === nextProps.message.status // Include status in comparison
  );
});
