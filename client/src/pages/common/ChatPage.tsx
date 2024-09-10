import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import ChatSidebar from "../../components/chatPage/ChatSidebar";
import ChatView from "../../components/chatPage/ChatView";

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isChatViewVisible, setIsChatViewVisible] = useState(false); // State to toggle between chat sidebar and view

  // Function to handle showing the chat view
  const handleChatSelect = () => {
    setIsChatViewVisible(true);
  };

  // Function to handle returning to the sidebar
  const handleBackToChats = () => {
    setIsChatViewVisible(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#f4f5f7",
        overflow: "hidden",
      }}
    >
      <Grid container>
        {/* Sidebar for chat list, hidden on mobile when chat view is active */}
        {!isChatViewVisible || !isMobile ? (
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              display: { xs: isMobile && isChatViewVisible ? "none" : "block" },
              borderRight: "1px solid #e0e0e0",
            }}
          >
            <ChatSidebar onChatSelect={handleChatSelect} />
          </Grid>
        ) : null}

        {/* Main chat view, hidden by default on mobile */}
        {isChatViewVisible && (
          <Grid item xs={12} md={9}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #e0e0e0",
                p: 1,
              }}
            >
              {isMobile && (
                <IconButton onClick={handleBackToChats}>
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography variant="h6">Chat</Typography>
            </Box>
            <ChatView />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ChatPage;
