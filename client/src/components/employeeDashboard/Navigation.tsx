// src/components/dashboard/NavigationComponent.tsx

import React from "react";
import { Paper, Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavigationComponent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: "12px" }}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Navigation
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/calendar")}
          sx={{ mb: 1, width: "100%" }}
        >
          Go to Calendar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/messages")}
          sx={{ width: "100%" }}
        >
          Go to Messages
        </Button>
      </Box>
    </Paper>
  );
};

export default React.memo(NavigationComponent);
