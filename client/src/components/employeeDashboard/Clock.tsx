// src/components/dashboard/ClockComponent.tsx

import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import Clock from "react-clock";
import "react-clock/dist/Clock.css";

const ClockComponent: React.FC = () => {
  const [value, setValue] = useState(new Date());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:785px)");
  const isDesktop = useMediaQuery("(min-width:1550px)");
  const isSlightlyMoreThanTablet = useMediaQuery(
    "(min-width:786px) and (max-width:990px)"
  );
  const isSuperMobile = useMediaQuery("(min-width:0px) and (max-width:380px)");

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
        height: "100%",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection={
          isSuperMobile
            ? "column"
            : isMobile
            ? "column"
            : isTablet
            ? "column"
            : "row"
        }
        gap={isSuperMobile ? 0 : isMobile ? 0 : 2}
        sx={{ height: "100%" }}
      >
        {/* Analog Clock */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Clock
            value={value}
            size={
              isSuperMobile
                ? 100
                : isMobile
                ? 150
                : isTablet
                ? 150
                : isSlightlyMoreThanTablet
                ? 150
                : 250
            }
            minuteHandLength={80}
            hourMarksWidth={2.5}
          />{" "}
          {/* Increased size by 25% */}
        </Box>

        {/* Digital Time and Date */}
        <Box
          sx={{
            textAlign: "center",
          }}
        >
          <Typography
            variant={isDesktop ? "h2" : "h4"}
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
