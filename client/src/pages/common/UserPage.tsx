// src/components/UserPage/UserPage.tsx

import { Box, Divider, useMediaQuery } from "@mui/material";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import AppSettings from "../../components/userPage/AppSettings";
import ManageUsers from "../../components/userPage/ManageUsers";
import ModifyAccount from "../../components/userPage/ModifyAccount";
import Sidebar from "../../components/userPage/SideBar";
import { selectCurrentUser } from "../../features/users/userSlice";
import ManageEntities from "../../components/userPage/ManageEntities";

type SelectedSection = "modify-account" | "app-settings" | "manage-users" | "manage-entities";

const UserPage: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 600px)");
  const currentUser = useAppSelector(selectCurrentUser);
  const [selectedSection, setSelectedSection] =
    useState<SelectedSection>("modify-account");

  // If no user is logged in, redirect to login or another appropriate page
  if (!currentUser || !currentUser._id) {
    return <Navigate to="/" replace />;
  }

  // Render the appropriate component based on the selected section
  // Render the appropriate component based on the selected section
  const renderSelectedSection = () => {
    switch (selectedSection) {
      case "modify-account":
        return <ModifyAccount />;
      case "app-settings":
        return <AppSettings />;
      case "manage-users":
        if (currentUser.role === "admin") {
          return <ManageUsers />;
        }
        return null;
      case "manage-entities":
        if (currentUser.role === "admin") {
          return <ManageEntities />;
        }
        return null;
      default:
        return <ModifyAccount />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: isMobile ? "100dvh" : "calc(100vh - 120px)", // Adjust height based on view
        overflowY: isMobile ? "hidden" : "hidden", // Enable scrolling within main content area
      }}
    >
      <Box
        sx={{
          height: "100%",
          position: "fixed", // Sidebar stays fixed in place
          overflowY: "auto", // Scroll independently if needed
          // Hide scrollbar for WebKit-based browsers (Chrome, Safari)
          "&::-webkit-scrollbar": {
            display: "none",
          },
          // Hide scrollbar for Firefox
          scrollbarWidth: "none",
          // Hide scrollbar for IE/Edge
          msOverflowStyle: "none",
        }}
      >
        <Sidebar onSelectSection={setSelectedSection} />
      </Box>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ ml: isMobile ? "70px" : "auto" }}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          px: isMobile ? 1 : 3,
          pt: isMobile ? 3 : 3,
          pb: isMobile ? 4 : 0,
          overflowY: "auto", // Always enable scrolling within main content area
          overflowX: "hidden", // Prevent horizontal scrolling
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          ml: isMobile ? 0 : "240px",
        }}
      >
        {renderSelectedSection()}
      </Box>
    </Box>
  );
};

export default UserPage;
