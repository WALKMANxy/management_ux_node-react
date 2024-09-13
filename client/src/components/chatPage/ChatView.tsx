// ChatView.tsx
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useAppDispatch } from "../../app/hooks";
import { clearCurrentChatReducer } from "../../features/chat/chatSlice";
import useLoadOlderMessages from "../../hooks/useChatLoadOlderMessages";
import useChatView from "../../hooks/useChatView"; // Import the custom hook
import InputBox from "./InputBox";
import RenderMessage from "./RenderMessage"; // Import the RenderMessage component
import RenderParticipantsAvatars from "./RenderParticipantsAvatars"; // Import the RenderParticipantsAvatars component

const ChatView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  const {
    currentChat,
    sortedMessages,
    menuAnchorEl,
    isMenuOpen,
    handleMenuOpen,
    handleMenuClose,
    getChatOptions,
    getChatTitle,
    getAdminAvatar,
    participantsData,
    currentUserId,
  } = useChatView(); // Destructure the hook values

  // Hook for loading older messages
  const { messagesContainerRef } = useLoadOlderMessages(
    currentChat?._id || null
  );

  // Function to handle returning to the sidebar on mobile
  const handleBackToChats = () => {
    dispatch(clearCurrentChatReducer()); // Clear currentChat to navigate back to sidebar
  };

  console.log("ChatView rendering now");

  // Fallback if currentChat is not set
  if (!currentChat) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#ffffff",
        }}
      >
        <Typography variant="h6" color="textSecondary">
          No chat selected. Please select a chat to view.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className="animate__animated animate__fadeInRight animate__faster"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // Fill the available height
        p: isMobile ? 0 : 2, // Remove padding on mobile
        paddingTop: isMobile ? 2 : 0,
        bgcolor: "#ffffff",
        borderTopRightRadius: 12, // Apply radius to the top-left corner
        borderBottomRightRadius: 12, // Apply radius to the bottom-left corner
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexShrink: 0, // Prevent shrinking of the header
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isMobile && (
            <IconButton onClick={handleBackToChats}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Avatar
            src={
              currentChat?.type === "simple"
                ? participantsData[0]?.avatar ?? ""
                : getAdminAvatar() ?? ""
            }
          />
          <Typography variant="h6" sx={{ ml: 2 }}>
            {getChatTitle()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <RenderParticipantsAvatars
            participantsData={participantsData}
            chatType={currentChat.type}
          />
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          {getChatOptions().map((option) => (
            <MenuItem key={option} onClick={handleMenuClose}>
              {option}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Messages Display */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: "1.5em", // Rounded corners for the paper
          flexGrow: 1, // Allows this section to take the available space
          overflowY: "auto", // Enable scrolling for messages
          display: "flex", // Add this line
          flexDirection: "column", // Add this line
          "&::-webkit-scrollbar": {
            display: "none",
          },
          position: "relative",
        }}
      >
        <Box
          sx={{
            p: 1,
            bgcolor: "#f9f9f9",
            borderRadius: 6,
            overflowY: "auto", // Enable scrolling for messages
            display: "flex", // Add this line
            flexDirection: "column", // Add this line
            "&::-webkit-scrollbar": {
              display: "none",
            },
            position: "relative",
          }}
          ref={messagesContainerRef} // Attach the ref from useLoadOlderMessages
        >
          <RenderMessage
            messages={sortedMessages}
            currentUserId={currentUserId}
            chatType={currentChat?.type || "simple"}
            participantsData={participantsData}
          />
        </Box>
      </Paper>

      {/* Message Input Box */}
      <Box
        sx={{
          mt: isMobile ? 0 : 2,
          mb: isMobile ? 0.6 : 0,
          flexShrink: 0, // Prevent shrinking of the input box
          borderRadius: "25px", // Rounded corners for the input box
        }}
      >
        <InputBox />
      </Box>
    </Box>
  );
};

export default React.memo(ChatView);
