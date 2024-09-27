// src/layout/Layout.tsx
import { Box, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";
import Header from "../components/Header/Header";
import { selectCurrentChat } from "../features/chat/chatSlice";

const Layout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currentChat = useAppSelector(selectCurrentChat);

  // Check if the current path matches specific routes
  const isClientsOrMessagesPage =
    location.pathname === "/clients" ||
    location.pathname === "/messages" ||
    location.pathname === "/visits" ||
    location.pathname === "/promos" ||
    location.pathname === "/calendar" ||
    location.pathname === "/movements" ||
    location.pathname === "/articles";
  const isSettingsPage = location.pathname === "/settings"; // Check if on the /settings page

  return (
    <ErrorBoundary>
      <Box sx={{}}>
        {/* Hide Header if currentChat exists and we are in mobile view */}
        {!currentChat || !isMobile ? <Header /> : null}
        <Box
          component="main"
          sx={{
            flex: 1, // Let main content grow to fill available space

            p: isClientsOrMessagesPage && isMobile ? 0 : 1, // Adjust padding for clients and messages pages
            pl: isSettingsPage ? 0 : undefined, // Remove left padding for settings page
            pr: isSettingsPage ? 0 : undefined,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default Layout;
