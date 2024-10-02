// src/components/dashboard/WhiteboardComponent.tsx

import React from "react";
import { Paper, Box, Typography } from "@mui/material";

const WhiteboardComponent: React.FC = () => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: "12px",
        maxHeight: 250,
        overflowY: "auto",
        bgcolor: "#ffffff",
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Admin Messages
        </Typography>
        <Typography variant="body2">
          {/* Placeholder for admin messages */}
          Scrollable admin messages will be displayed here.
          <br />
          - Welcome to the Employee Dashboard!
          <br />
          - Don't forget to check the latest updates.
          <br />
          - Upcoming company events will be announced here.
          {/* Add more messages as needed */}
        </Typography>
      </Box>
    </Paper>
  );
};

export default React.memo(WhiteboardComponent);
