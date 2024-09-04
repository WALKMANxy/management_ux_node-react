// DrawerContainer.tsx
import React from "react";
import { Box, Drawer,  Paper } from "@mui/material";
import CalendarComponent from "./CalendarComponent"; // Adjust the import path if needed
import UpcomingVisits from "./UpcomingVisits"; // Adjust the import path if needed

interface DrawerContainerProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  fabPosition?: { top: number; left: number }; // Optional position prop for positioning
}

const DrawerContainer: React.FC<DrawerContainerProps> = ({
  open,
  onClose,
  isLoading,
  fabPosition = { top: 0, left: 0 }, // Default position for drawer
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        component: Paper, // To ensure it can have specific styles
        sx: {
          height: "auto",
          width: "auto", // Allow the width to adjust to the content
          maxWidth: "85vw", // Set a maximum width for responsiveness
          borderRadius: "16px", // Rounded corners on all sides
          position: "fixed", // Position fixed to place it manually
          top: fabPosition.top + 315, // Adjust the top position based on the button's position + offset
          backgroundColor: "#FFF5E1", // Warm white background color
          backdropFilter: "blur(50px)", // iOS-like blur effect
          margin: "20px", // Adds some margin for a more visually appealing placement
          overflow: "hidden", // Prevent content overflow
          boxShadow: 20, // Add shadow for a floating effect
        },
      }}
      ModalProps={{
        keepMounted: true,
        sx: {
          backdropFilter: "blur(5px)", // Blur the background when the drawer is open
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Darken the screen with an overlay
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >

        <CalendarComponent />
        <UpcomingVisits isLoading={isLoading} />
      </Box>
    </Drawer>
  );
};

export default DrawerContainer;
