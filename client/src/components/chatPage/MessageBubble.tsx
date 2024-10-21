// src/components/chatPage/MessageBubble.tsx

import { Avatar, Box, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { selectCurrentChat } from "../../features/chat/chatSlice";
import { Attachment, IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";
import "../../Styles/styles.css";
import AttachmentPreview from "./AttachmentPreview";
import MessageStatusIcon from "./MessageStatusIcon";

interface MessageBubbleProps {
  message: IMessage;
  participantsData: Partial<User>[]; // Array of participants data passed from ChatView
  chatType: string;
  openFileViewer: (isPreview: boolean, fileName?: string) => void; // Add this line
  downloadAndStoreFile: (attachment: Attachment) => Promise<void>;
  handleSave: (fileName: string) => void;
  downloadedFiles: Attachment[];
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  participantsData = [],
  chatType,
  openFileViewer,
  downloadAndStoreFile,
  handleSave,
}) => {
  // console.log("MessageBubble rendering now");

  const { t } = useTranslation();
  const currentUserId = useAppSelector((state: RootState) => state.auth.userId);
  const isOwnMessage = message.sender === currentUserId;
  const currentChat = useAppSelector(selectCurrentChat);
  const currentChatType = currentChat?.type;
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

  const getBackgroundColor = () => {
    if (message.status === "failed") {
      return "rgba(128, 128, 128, 0.3)"; // Gray background for failed messages
    }

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

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullTimestamp = new Date(message.timestamp).toLocaleString();

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
                <AttachmentPreview
                  attachments={message.attachments}
                  openFileViewer={openFileViewer}
                  downloadAndStoreFile={downloadAndStoreFile}
                  handleSave={handleSave}
                  isOwnMessage={isOwnMessage}
                />
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

export default React.memo(MessageBubble);
