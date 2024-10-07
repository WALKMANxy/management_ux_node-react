// src/components/dashboard/WhiteboardComponent.tsx

import { Box, Paper, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/users/userSlice";
import useChatLogic from "../../hooks/useChatsLogic";
import { IMessage } from "../../models/dataModels";
import RenderMessages from "../chatPage/RenderMessage";

const WhiteboardComponent: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const userId = currentUser?._id;
  const {
    employeeWhiteboardBroadcast,
    broadcastChat,
    users,
    markMessagesAsRead,
  } = useChatLogic();

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
    messagesEndRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
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
        maxHeight: "40dvh", // Adjusted height for better visibility
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
          pb: 1, // Padding bottom for separation
        }}
      >
        <Typography variant="h6" gutterBottom>
          Company Whiteboard
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flexGrow: 1,

          overflowY: "auto",
          mt: 1, // Margin top for spacing below header
          pb: 1, // Padding bottom for spacing above the scroll target
          // Hide scrollbar
          "&.webkitScrollbar": {
            display: "none",
          },
          msOverflowStyle: "none", // IE and Edge
          scrollbarWidth: "none", // Firefox
        }}
        ref={messagesContainerRef}
        onClick={handleWhiteboardClick} // Attach click handler
      >
        {broadcastChat && employeeWhiteboardBroadcast.length > 0 ? (
          <RenderMessages
            messages={employeeWhiteboardBroadcast}
            currentUserId={userId!}
            chatType={broadcastChat.type}
            participantsData={broadcastParticipants}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No admin messages available.
          </Typography>
        )}
        {/* Dummy div to scroll into view */}
        <div ref={messagesEndRef} />
      </Box>
    </Paper>
  );
};

export default React.memo(WhiteboardComponent);
