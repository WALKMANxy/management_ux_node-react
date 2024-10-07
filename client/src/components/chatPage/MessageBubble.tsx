// src/components/chatPage/MessageBubble.tsx

import { Avatar, Box, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { selectCurrentChat } from "../../features/chat/chatSlice";
import { useFilePreview } from "../../hooks/useFilePreview";
import { IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";
import "../../Styles/styles.css";
import MessageStatusIcon from "./MessageStatusIcon";
import AttachmentPreview from "./AttachmentPreview";

interface MessageBubbleProps {
  message: IMessage;
  participantsData: Partial<User>[]; // Array of participants data passed from ChatView
  chatType: string;
}

/**
 * MessageBubble Component
 * Displays an individual chat message with appropriate styling and metadata.
 *
 * @param {MessageBubbleProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  participantsData = [],
  chatType,
}) => {
  const { t } = useTranslation();
  const currentUserId = useAppSelector((state: RootState) => state.auth.userId);
  const isOwnMessage = message.sender === currentUserId;
  const currentChat = useAppSelector(selectCurrentChat);
  const currentChatType = currentChat?.type;
  const { openFileViewer } = useFilePreview();

  // Find the sender's details from the participants data
  const sender = participantsData.find((user) => user._id === message.sender);
  const senderAvatar = sender?.avatar || "";
  const senderName = sender?.entityName || "";

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

  /**
   * Determines the background color of the message bubble based on message type and ownership.
   *
   * @returns {string} The background color.
   */
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
  /**
   * Formats the timestamp for display.
   *
   * @returns {string} The formatted time string.
   */
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  /**
   * Formats the full timestamp for the tooltip.
   *
   * @returns {string} The formatted full timestamp.
   */
  const fullTimestamp = new Date(message.timestamp).toLocaleString();

  /**
   * Determines whether to display the sender's name.
   *
   * @returns {boolean} True if the sender's name should be displayed; otherwise, false.
   */
  const shouldDisplaySenderName = () => {
    // Display sender's name only in group and broadcast chats for messages not from the current user
    return (
      !isOwnMessage &&
      (chatType === "group" || chatType === "broadcast") &&
      senderName
    );
  };

  return (
    <Box
      className={animationClass}
      sx={{
        display: "flex",
        flexDirection: isOwnMessage ? "row-reverse" : "row", // Control the message direction
        alignItems: "flex-end",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        maxWidth: "75%", // Control bubble width without making it float away from its anchor
      }}
    >
      {/* Show sender avatar only if the message is not from the current user and in group chats */}
      {!isOwnMessage && currentChatType === "group" && (
        <Avatar
          src={senderAvatar}
          alt={sender?.entityName || t("messageBubble.labels.unknownSender")}
          sx={{ width: 32, height: 32, mr: 1 }}
        />
      )}

      {/* Container for Sender's Name and Message Bubble */}
      <Box>
        {/* Conditionally render the sender's name */}
        {shouldDisplaySenderName() && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textAlign: isOwnMessage ? "right" : "left",
              ml: 1,
            }}
          >
            {senderName}
          </Typography>
        )}

        {/* Message Bubble with Frosted Glass Effect */}
        <Tooltip title={fullTimestamp} arrow>
          <Box
            sx={{
              p: 1.5,
              bgcolor: getBackgroundColor(),
              borderRadius: "1em",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
              maxWidth: "100%", // Ensure the bubble doesn’t exceed the parent width
              textAlign: "left", // Align text based on the message direction
              backdropFilter: "blur(10px)", // Frosted glass effect
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

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {message.attachments.map((attachment, index) => (
                  <AttachmentPreview
                    key={index}
                    attachment={attachment}
                    isUploading={message.isUploading}
                    uploadProgress={message.uploadProgress}
                    onClick={() => openFileViewer(attachment, false)} // Call openFileViewer from the hook
                  />
                ))}
              </Box>
            )}

            <Box
              sx={{
                color: "gray",
                display: "flex",
                alignItems: "center",
                mb: -1,
                mt: 0.5,
                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                gap: 0.5,
              }}
            >
              <Typography variant="caption">{formattedTime}</Typography>
              <MessageStatusIcon
                message={message}
                chatType={chatType}
                participantsData={participantsData}
                isOwnMessage={isOwnMessage}
              />
            </Box>
          </Box>
        </Tooltip>
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
    prevProps.message.status === nextProps.message.status
  );
});
