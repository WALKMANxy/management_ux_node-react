import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import {  useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import ChatSidebar from "../../components/chatPage/ChatSidebar";
import ChatView from "../../components/chatPage/ChatView";

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Get currentChat from Redux state
  const currentChat = useAppSelector(
    (state: RootState) => state.chats.currentChat
  );

  // Function to handle returning to the sidebar on mobile
  /* const handleBackToChats = () => {
    dispatch(clearCurrentChatReducer()); // Clear currentChat to navigate back to sidebar
  };
 */
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "94dvh" : "calc(100vh - 120px)", // Use 95vh when isMobile is true, otherwise subtract the header height
        bgcolor: "#f4f5f7",
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ flexGrow: 1, height: "100%" }}>
        {/* Sidebar for chat list, hidden on mobile when chat view is active */}
        {!currentChat || !isMobile ? (
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              display: { xs: isMobile && currentChat ? "none" : "block" },
              borderRight: "1px solid #e0e0e0",
              height: "100%", // Ensure sidebar fills available height
              overflowY: "auto", // Enable scrolling if content overflows
            }}
          >
            <ChatSidebar />
          </Grid>
        ) : null}

        {/* Main chat view, hidden by default on mobile */}
        {currentChat && (
          <Grid
            item
            xs={12}
            md={9}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%", // Ensure chat view fills available height
            }}
          >
            <ChatView />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ChatPage;
