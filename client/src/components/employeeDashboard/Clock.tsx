// src/components/dashboard/ClockComponent.tsx

import { Box, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Clock from "react-clock";
import "react-clock/dist/Clock.css";

const ClockComponent: React.FC = () => {
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Format time and date with 24-hour format
  const formattedTime = value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Ensures 24-hour format
  });
  const formattedDate = value.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "16px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection={{ xs: "column", sm: "row" }}
      >
        {/* Analog Clock */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: { xs: 2, sm: 0 },
          }}
        >
          <Clock value={value} size={125} /> {/* Increased size by 25% */}
        </Box>

        {/* Digital Time and Date */}
        <Box
          sx={{
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 600,
              color: "#333",
              mb: 1,
            }}
          >
            {formattedTime}
          </Typography>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontWeight: 400,
              color: "#666",
            }}
          >
            {formattedDate}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(ClockComponent);
