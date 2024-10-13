import { Box, Grid, useMediaQuery } from "@mui/material";
import React from "react";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import ChatSidebar from "../../components/chatPage/ChatSidebar";
import ChatView from "../../components/chatPage/ChatView";

const ChatPage: React.FC = () => {
  const isMobile = useMediaQuery("(max-width:800px)");
  const isTablet = useMediaQuery("(min-width:800px) and (max-width:1250px)");

  // Get currentChat from Redux state
  const currentChat = useAppSelector(
    (state: RootState) => state.chats.currentChat
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "100dvh" : "calc(100vh - 80px)", // Adjust height based on view
        bgcolor: "#f4f5f7",
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ flexGrow: 1, height: "100%" }}>
        {/* Sidebar for chat list, hidden on mobile when chat view is active */}
        <Grid
          item
          xs={isTablet ? 3 : 12}
          md={3}
          sx={{
            display: { xs: isMobile && currentChat ? "none" : "block" }, // Hide sidebar on mobile if chat is open
            borderRight: "1px solid #e0e0e0",
            height: "100%", // Ensure sidebar fills available height
            overflowY: "auto", // Enable scrolling if content overflows
            minWidth: "20dvh",
            position: isMobile ? "absolute" : "relative", // Make sidebar absolute on mobile for better positioning
            zIndex: isMobile ? 1 : "auto", // Ensure it's above chat view
            width: isMobile ? "100%" : "auto", // Full width on mobile
          }}
        >
          <ChatSidebar />
        </Grid>

        {/* Main chat view, hidden by default on mobile */}
        <Grid
          item
          xs={true}
          md={true}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%", // Ensure chat view fills available height
            width: "100%", // Full width for chat view on mobile
            position: isMobile ? "relative" : "static", // Adjust positioning for mobile
          }}
        >
          {currentChat && <ChatView />}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatPage;
