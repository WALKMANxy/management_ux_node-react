// src/components/dashboard/WhiteboardComponent.tsx
import { Box, Paper, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectDownloadedFiles } from "../../features/downloads/downloadedFilesSlice";
import { selectCurrentUser } from "../../features/users/userSlice";
import useChatLogic from "../../hooks/useChatsLogic";
import { useFilePreview } from "../../hooks/useFilePreview";
import { IMessage } from "../../models/dataModels";
import RenderMessages from "../chatPage/RenderMessage";

const WhiteboardComponent: React.FC = () => {
  const { t } = useTranslation();

  const currentUser = useAppSelector(selectCurrentUser);
  const userId = currentUser?._id;
  const {
    employeeWhiteboardBroadcast,
    broadcastChat,
    users,
    markMessagesAsRead,
  } = useChatLogic();

  const { openFileViewer, downloadAndStoreFile, handleSave } = useFilePreview();

  const downloadedFiles = useAppSelector(selectDownloadedFiles);

  const isMobile = useMediaQuery("(max-width:600px)");

  // Ref to the messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Ref to the messages container to attach click handler
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Find participants data for the broadcast chat
  const broadcastParticipants = useMemo(() => {
    if (!broadcastChat) return [];
    return users.filter((user) =>
      broadcastChat.participants.includes(user._id ?? "")
    );
  }, [broadcastChat, users]);

  // Function to scroll to the bottom (newest message)
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to the bottom whenever new messages are added
  useEffect(() => {
    if (employeeWhiteboardBroadcast.length > 0) {
      scrollToBottom();
    }
  }, [employeeWhiteboardBroadcast]);

  // Click handler to mark messages as read
  const handleWhiteboardClick = () => {
    if (broadcastChat && userId) {
      // Check if there are any unread messages
      const unreadMessageIds = broadcastChat.messages
        .filter(
          (message: IMessage) =>
            !message.readBy.map((id) => id.toString()).includes(userId) &&
            message.sender.toString() !== userId
        )
        .map((message) =>
          message.local_id
            ? message.local_id.toString()
            : message._id.toString()
        );

      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(broadcastChat, userId);
      }
      // If no unread messages, do nothing
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: "12px",
        maxHeight: isMobile ? "550px" : "40dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
        height: "auto",
      }}
    >
      {/* Header - Always Visible */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "#f5f5f5",
          zIndex: 1,
          pb: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t("whiteboard.companyWhiteboard", "Company Whiteboard")}
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flexGrow: 1,

          overflowY: "auto",
          mt: 1,
          pb: 1,
          "&.webkitScrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        ref={messagesContainerRef}
        onClick={handleWhiteboardClick}
      >
        {broadcastChat && employeeWhiteboardBroadcast.length > 0 ? (
          <RenderMessages
            messages={employeeWhiteboardBroadcast}
            currentUserId={userId!}
            chatType={broadcastChat.type}
            participantsData={broadcastParticipants}
            openFileViewer={openFileViewer}
            downloadAndStoreFile={downloadAndStoreFile}
            handleSave={handleSave}
            downloadedFiles={downloadedFiles}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("whiteboard.noAdminMessages", "No admin messages available.")}
          </Typography>
        )}
        {/* Dummy div to scroll into view */}
        <div ref={messagesEndRef} />
      </Box>
    </Paper>
  );
};

export default React.memo(WhiteboardComponent);
