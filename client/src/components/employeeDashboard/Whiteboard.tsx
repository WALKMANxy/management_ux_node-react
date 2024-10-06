// src/components/dashboard/WhiteboardComponent.tsx

import { Box, Paper, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/users/userSlice";
import useChatLogic from "../../hooks/useChatsLogic";
import RenderMessages from "../chatPage/RenderMessage";

const WhiteboardComponent: React.FC = () => {
  const userId = useAppSelector(selectCurrentUser)?._id;
  const { employeeWhiteboardBroadcast, broadcastChat, users } = useChatLogic();

  // Find participants data for the broadcast chat
  const broadcastParticipants = useMemo(() => {
    if (!broadcastChat) return [];
    return users.filter((user) =>
      broadcastChat.participants.includes(user._id ?? "")
    );
  }, [broadcastChat, users]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: "12px",
        maxHeight: 550,
        overflowY: "auto",
        bgcolor: "#f9f9f9",
        height: "100%",
      }}
    >
      <Box
        sx={{
          height: "100%",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Admin Messages
        </Typography>
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
      </Box>
    </Paper>
  );
};

export default React.memo(WhiteboardComponent);
