// ChatView.tsx
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { IMessage } from "../../models/dataModels";
import InputBox from "./InputBox";
import MessageBubble from "./MessageBubble";

const ChatView: React.FC = () => {
  // First, get the currentChatId from the currentChat state
  const currentChatId = useSelector(
    (state: RootState) => state.chats.currentChat?._id
  );

  // Get the correct chat from the chats state
  const currentChat = useSelector((state: RootState) =>
    currentChatId ? state.chats.chats[currentChatId] : null
  );

  // Sort messages by timestamp before rendering
  const sortedMessages = useMemo(() => {
    return currentChat?.messages
      ? [...currentChat.messages].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      : [];
  }, [currentChat?.messages]);

  const currentUserId = useSelector((state: RootState) => state.auth.userId);
  const users = useSelector((state: RootState) => state.users.users);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref to scroll to the latest message

  // Handler for opening the options menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handler for closing the options menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Extracted layout logic for individual messages based on sender and chat type
  const renderMessage = (message: IMessage) => {
    const isOwnMessage = message.sender === currentUserId;

    return (
      <Box
        key={message._id}
        sx={{
          display: "flex",
          justifyContent: isOwnMessage ? "flex-end" : "flex-start", // Anchor to the correct side
          mb: 2,
        }}
      >
        {/* Render the MessageBubble with correct layout */}
        <MessageBubble
          message={message}
          participantsData={participantsData}
          chatType={currentChat?.type || "simple"}
        />
      </Box>
    );
  };

  // Dynamic participants avatar rendering based on chat type
  const renderParticipantsAvatars = () => {
    if (!currentChat || currentChat.type === "simple") return null;

    const participantsData =
      currentChat?.participants?.map((participantId) => users[participantId]) ||
      [];

    const limitedParticipants = participantsData.slice(0, 3);

    const participantAvatars = limitedParticipants.map((participant) => (
      <Avatar
        key={participant?._id}
        src={participant?.avatar}
        sx={{ width: 30, height: 30, ml: -1 }}
      />
    ));

    const remainingParticipants = participantsData.length - 3;

    return (
      <>
        {participantAvatars}
        {remainingParticipants > 0 && (
          <Badge
            badgeContent={`+${remainingParticipants}`}
            color="primary"
            sx={{ ml: -1 }}
          />
        )}
      </>
    );
  };

  // Get participants data by mapping the user IDs in currentChat to user details
  const participantsData =
    currentChat?.participants.map((participantId) => users[participantId]) ||
    [];

  // Define mock options based on chat type and user role
  const getChatOptions = () => {
    if (!currentChat) return [];

    if (
      currentChat.type === "group" &&
      currentChat.admins &&
      currentChat.admins.includes(currentUserId)
    ) {
      return ["Edit group name", "Edit group members", "Delete chat"];
    } else if (currentChat.type === "group") {
      return ["Archive chat"];
    } else if (
      currentChat.type === "broadcast" &&
      currentChat.admins &&
      currentChat.admins.includes(currentUserId)
    ) {
      return [
        "Edit broadcast name",
        "Edit broadcast members",
        "Delete broadcast",
      ];
    } else if (currentChat.type === "broadcast") {
      return ["Archive chat"];
    } else {
      return ["Archive chat"];
    }
  };

  // Determine the chat title and admin avatar based on chat type
  const getChatTitle = () => {
    if (!currentChat) return "Chat";

    if (currentChat.type === "simple" && currentChat.participants) {
      const participantId = currentChat.participants.find(
        (id) => id !== currentUserId
      );
      if (participantId !== undefined) {
        const participant = users[participantId];
        return participant?.entityName || "Chat";
      }
    }
    return currentChat?.name || "Group Chat";
  };

  const getAdminAvatar = () => {
    if (
      currentChat &&
      currentChat.type !== "simple" &&
      currentChat.admins?.length
    ) {
      const admin = users[currentChat.admins[0]];
      return admin?.avatar;
    }
    return null;
  };

  // Scroll to the latest message whenever a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

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
        p: 2,
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
          <Avatar
            src={
              currentChat?.type === "simple"
                ? users[currentChat?.participants[0]]?.avatar ?? ""
                : getAdminAvatar() ?? ""
            }
          />

          <Typography variant="h6" sx={{ ml: 2 }}>
            {getChatTitle()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {renderParticipantsAvatars()}
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
          "&::-webkit-scrollbar": {
            display: "none", // Hide the scrollbar
          },
        }}
      >
        <Box
          sx={{
            flexGrow: 1, // Allows this section to take the available space
            overflowY: "auto", // Enable scrolling for messages
            p: 1,
            bgcolor: "#f9f9f9",
            borderRadius: 6,
            "&::-webkit-scrollbar": {
              display: "none", // Hide the scrollbar
            },
          }}
        >
          {sortedMessages.map((message: IMessage) => renderMessage(message))}
          <div ref={messagesEndRef} />
        </Box>
      </Paper>
      {/* Message Input Box */}
      <Box
        sx={{
          mt: 2,
          flexShrink: 0, // Prevent shrinking of the input box
          borderRadius: "25px", // Rounded corners for the input box
        }}
      >
        <InputBox
        // Optional props to handle input focus when sending a message, depending on InputBox's implementation
        />
      </Box>
    </Box>
  );
};

export default ChatView;
