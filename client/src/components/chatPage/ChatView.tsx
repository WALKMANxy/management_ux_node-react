// src/components/chatPage/ChatView.tsx

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Avatar,
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../app/hooks";
import { clearCurrentChatReducer } from "../../features/chat/chatSlice";
import useLoadOlderMessages from "../../hooks/useChatLoadOlderMessages";
import useChatView from "../../hooks/useChatView"; // Import the custom hook
import { useFilePreview } from "../../hooks/useFilePreview";
import { IChat } from "../../models/dataModels";
import { canUserChat } from "../../utils/chatUtils";
import Spinner from "../common/Spinner";
import CreateChatForm from "./CreateChatForm"; // Import CreateChatForm
import FileViewer from "./FileViewer";
import InputBox from "./InputBox";
import RenderMessage from "./RenderMessage"; // Import the RenderMessage component
import RenderParticipantsAvatars from "./RenderParticipantsAvatars"; // Import the RenderParticipantsAvatars component

const ChatView: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:800px)");
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(false);

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

  const { isViewerOpen, closeFileViewer, isPreview } = useFilePreview();

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

  // Construct the tooltip content with participant names
  const tooltipContent = (
    <Box>
      {participantsData
        .filter((user) => user.entityName) // Ensure entityName exists
        .map((user, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ whiteSpace: "pre-line" }}
          >
            {user.entityName}
          </Typography>
        ))}
    </Box>
  );

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  // State for Edit Chat Form
  const [isEditChatFormOpen, setIsEditChatFormOpen] = useState(false);
  const [chatToEdit, setChatToEdit] = useState<IChat | null>(null);

  // Handle MenuItem clicks
  const handleMenuItemClick = (option: string) => {
    handleMenuClose(); // Close the menu first

    if (option === "edit_group" || option === "edit_broadcast") {
      setChatToEdit(currentChat);
      setIsEditChatFormOpen(true);
    }

    // Handle other options like mute, archive_chat, delete_chat as needed
    // e.g., if (option === "mute") { ... }
  };

  // Fallback if currentChat is not set
  if (!currentChat) {
    return <Spinner />;
  }

  return (
    <Box
      className="animate__animated animate__fadeInRight animate__faster"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
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
                : getAdminAvatar ?? ""
            }
            alt={getChatTitle}
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="h6" sx={{ ml: 2 }}>
            {getChatTitle}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Wrap RenderParticipantsAvatars with Tooltip */}
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <div>
              <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                onClose={handleTooltipClose}
                open={open}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title={tooltipContent}
                arrow
              >
                <Box onClick={handleTooltipOpen} sx={{ cursor: "pointer" }}>
                  <RenderParticipantsAvatars
                    participantsData={participantsData}
                    chatType={currentChat.type}
                  />
                </Box>
              </Tooltip>
            </div>
          </ClickAwayListener>

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
          {getChatOptions.map((option) => (
            <MenuItem key={option} onClick={() => handleMenuItemClick(option)}>
              {t(`chatView.menuOptions.${option}`)}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Divider sx={{ mb: -1 }} />

      {/* Messages Display */}
      <Paper
        elevation={1}
        sx={{
          flexGrow: 1,
          borderRadius: "1.5em", // Rounded corners for the paper
          overflowY: "auto", // Enable scrolling for messages
          display: "flex",
          flexDirection: "column",
          "&::webkitScrollbar": {
            display: "none",
          },
          position: "relative",
          height: "100dvh", // Adjust height based on mobile or desktop
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: 1,
            bgcolor: "#f9f9f9",
            borderRadius: 6,
            overflowY: "auto", // Enable scrolling for messages
            display: "flex",
            pb: 10,

            flexDirection: "column",
            "&::webkitScrollbar": {
              display: "none",
            },

            position: "relative",
          }}
          ref={messagesContainerRef} // Attach the ref from useLoadOlderMessages
        >
          <div ref={topRef} style={{}}></div> {/* Add this line */}
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
          zIndex: 10,
          bottom: 0,
          position: "sticky",
        }}
      >
        <InputBox canUserChat={isUserAllowedToChat} />
      </Box>

      {/* File Viewer */}
      {isViewerOpen && (
        <FileViewer onClose={() => closeFileViewer(isPreview)} />
      )}

      {/* Edit Chat Form */}
      {isEditChatFormOpen && chatToEdit && (
        <CreateChatForm
          open={isEditChatFormOpen}
          onClose={() => {
            setIsEditChatFormOpen(false);
            setChatToEdit(null); // Reset the chat to edit
          }}
          chat={chatToEdit} // Pass the chat data to prefill the form
        />
      )}
    </Box>
  );
};

export default React.memo(ChatView);
