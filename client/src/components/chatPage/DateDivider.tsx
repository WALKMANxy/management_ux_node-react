// DateDivider.tsx
import { Box, Typography } from "@mui/material";
import React from "react";
import { formatDateForDivider } from "../../utils/chatUtils"; // Adjust the import path as necessary

interface DateDividerProps {
  date: Date;
}

const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        my: 2, // Vertical margin
      }}
    >
      <Box
        sx={{
          bgcolor: "#e0e0e0",
          px: 2, // Horizontal padding
          py: 0.5, // Vertical padding
          borderRadius: "12px",
        }}
      >
        <Typography variant="caption" color="textSecondary">
          {formatDateForDivider(date)}
        </Typography>
      </Box>
    </Box>
  );
};

export default React.memo(DateDivider);
