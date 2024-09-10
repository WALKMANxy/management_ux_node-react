// ChatView.tsx
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import useChatLogic from "../../hooks/useChatsLogic";
import { IMessage } from "../../models/dataModels";
import InputBox from "./InputBox";
import MessageBubble from "./MessageBubble";

const ChatView: React.FC = () => {
  const { messages } = useChatLogic();
  const currentChat = useSelector(
    (state: RootState) => state.chats.currentChat
  );
  const currentUserId = useSelector((state: RootState) => state.auth.userId);
  const users = useSelector((state: RootState) => state.users.users);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  // Handler for opening the options menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handler for closing the options menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Dynamic participants avatar rendering based on chat type
  const renderParticipantsAvatars = () => {
    if (currentChat?.type === "simple") return null;

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
    if (currentChat?.type === "simple" && currentChat.participants) {
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
  return (
    <Box
      className="animate__animated animate__fadeInRight animate__faster"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        p: 2,
        bgcolor: "#ffffff",
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
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

      {/* Messages Display */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "#f9f9f9",
          borderRadius: 2,
        }}
      >
        {messages.map((message: IMessage) => (
          <MessageBubble
            key={message._id}
            message={message}
            participantsData={participantsData}
            chatType={currentChat?.type || "simple"} // Pass the chat type
          />
        ))}
      </Box>

      {/* Message Input Box */}
      <InputBox />
    </Box>
  );
};

export default ChatView;
