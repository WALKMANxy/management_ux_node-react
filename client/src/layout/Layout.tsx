// src/layout/Layout.tsx
import { Box, useMediaQuery, useTheme } from "@mui/material";
import "animate.css";

import React, { useMemo } from "react";
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
  const isOtherPage =
    location.pathname === "/clients" ||
    location.pathname === "/visits" ||
    location.pathname === "/promos" ||
    location.pathname === "/calendar" ||
    location.pathname === "/movements" ||
    location.pathname === "/employee-dashboard" ||
    location.pathname === "/articles" ||
    location.pathname === "/dashboard";
  const isSettingsPage = location.pathname === "/settings"; // Check if on the /settings page

  const isMessagesPage = location.pathname === "/messages";

  // Determine padding based on current page and device type
  const determinePadding = useMemo(() => {
    return () => {
      if (isMessagesPage) {
        return isMobile ? 0 : 1; // Messages Page: 0 on mobile, 1 on desktop
      } else if (isOtherPage) {
        return isMobile ? 0 : 2; // Other Pages: 0 on mobile, 4 on desktop
      } else {
        return 4; // Default padding for unspecified pages on desktop
      }
    };
  }, [isMessagesPage, isOtherPage, isMobile]);

  // Determine if the header should be displayed
  const shouldShowHeader = useMemo(
    () => !currentChat || !isMobile,
    [currentChat, isMobile]
  );
  return (
    <ErrorBoundary>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          overflowX: "hidden",
        }}
      >
        {/* Hide Header if currentChat exists and we are in mobile view */}
        {shouldShowHeader && <Header />}
        <Box
          component="main"
          key={location.pathname}
          className="animate__animated animate__fadeIn"
          sx={{
            flex: 1, // Let main content grow to fill available space

            p: determinePadding(), // Apply dynamic padding
            pl: isSettingsPage ? 0 : undefined, // Remove left padding for settings page
            pr: isSettingsPage ? 0 : undefined, // Remove right padding for settings page
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default Layout;
