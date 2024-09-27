// src/components/chatPage/ChatView.tsx

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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../app/hooks";
import { clearCurrentChatReducer } from "../../features/chat/chatSlice";
import useLoadOlderMessages from "../../hooks/useChatLoadOlderMessages";
import useChatView from "../../hooks/useChatView"; // Import the custom hook
import { canUserChat } from "../../utils/chatUtils";
import InputBox from "./InputBox";
import RenderMessage from "./RenderMessage"; // Import the RenderMessage component
import RenderParticipantsAvatars from "./RenderParticipantsAvatars"; // Import the RenderParticipantsAvatars component

const ChatView: React.FC = () => {
  const { t } = useTranslation();
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
  const { messagesContainerRef, topRef } = useLoadOlderMessages(
    currentChat?._id || null
  );

  /**
   * Handles returning to the sidebar on mobile by clearing the current chat.
   */
  const handleBackToChats = () => {
    dispatch(clearCurrentChatReducer()); // Clear currentChat to navigate back to sidebar
  };

  // Determine if the user can chat using useMemo for optimization
  const isUserAllowedToChat = useMemo(() => {
    if (!currentChat || !currentUserId) {
      return false;
    }
    return canUserChat(currentChat, currentUserId);
  }, [currentChat, currentUserId]);

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
          {t("chatView.labels.noChatSelected")}
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
        height: "100dvh", // Fill the available height
        px: isMobile ? 0 : 1, // Remove padding on mobile
        paddingTop: isMobile ? 1 : 0,
        bgcolor: "#ffffff",
        borderTopRightRadius: 12, // 16px equivalent
        borderBottomRightRadius: 12, // 16px equivalent
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky", // Keeps the header at the top
          top: 0,
          zIndex: 10,
          bgcolor: "#ffffff",
          flexShrink: 0, // Prevent shrinking
          p: isMobile ? 1 : 2,
          borderBottom: "1px solid #e0e0e0", // Optional: a border for separation
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isMobile && (
            <Tooltip title={t("chatView.tooltips.backToChats")}>
              <IconButton
                onClick={handleBackToChats}
                aria-label={t("chatView.tooltips.backToChats")}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Avatar
            src={
              currentChat?.type === "simple"
                ? participantsData[0]?.avatar ?? ""
                : getAdminAvatar() ?? ""
            }
            alt={getChatTitle()}
            sx={{ width: 40, height: 40 }}
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
          <Tooltip title={t("chatView.tooltips.moreOptions")}>
            <IconButton
              onClick={handleMenuOpen}
              aria-label={t("chatView.tooltips.moreOptions")}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          {getChatOptions().map((option) => (
            <MenuItem key={option} onClick={handleMenuClose}>
              {t(`chatView.menuOptions.${option}`)}
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
          overflowY: "auto", // Enable scrolling for messages
          display: "flex",
          flexDirection: "column",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          position: "relative",
          height: isMobile ? "100dvh" : "100dvh", // Adjust height based on mobile or desktop
        }}
      >
        <Box
          sx={{
            p: 1,
            bgcolor: "#f9f9f9",
            borderRadius: 6,
            overflowY: "auto", // Enable scrolling for messages
            display: "flex",
            pb: 10,

            flexDirection: "column",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            position: "relative",
            flexGrow: 1,
          }}
          ref={messagesContainerRef} // Attach the ref from useLoadOlderMessages
        >
          <div ref={topRef} style={{ height: 1 }}></div> {/* Add this line */}
          <RenderMessage
            messages={sortedMessages || []}
            currentUserId={currentUserId}
            chatType={currentChat?.type || "simple"}
            participantsData={participantsData}
          />
        </Box>
      </Paper>

      {/* Message Input Box */}
      <Box
        sx={{
          mt: isMobile ? -10 : 0,
          flexShrink: 0, // Prevent shrinking of the input box
          borderRadius: isMobile ? "0px" : "25px", // Rounded corners for the input box
          position: "sticky", // Keep the input box sticky at the bottom
          bottom: 0,
          zIndex: 10,
        }}
      >
        <InputBox canUserChat={isUserAllowedToChat} />
      </Box>
    </Box>
  );
};

export default React.memo(ChatView);
