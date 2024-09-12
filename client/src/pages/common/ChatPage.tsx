import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Grid, IconButton, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import ChatSidebar from "../../components/chatPage/ChatSidebar";
import ChatView from "../../components/chatPage/ChatView";
import { clearCurrentChatReducer } from "../../features/chat/chatSlice";

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  // Get currentChat from Redux state
  const currentChat = useAppSelector(
    (state: RootState) => state.chats.currentChat
  );

  // Function to handle returning to the sidebar on mobile
  const handleBackToChats = () => {
    dispatch(clearCurrentChatReducer()); // Clear currentChat to navigate back to sidebar
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)", // Adjust height to subtract the header height (adjust '64px' to your header's actual height)
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0, // Prevent the header from shrinking
              }}
            >
              {isMobile && (
                <IconButton onClick={handleBackToChats}>
                  <ArrowBackIcon />
                </IconButton>
              )}
            </Box>
            <Box
              sx={{
                flexGrow: 1, // Take the remaining space
                height: "100vh",

                overflowY: "auto", // Enable scrolling within the chat messages area
              }}
            >
              <ChatView />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ChatPage;
