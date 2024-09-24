// src/components/chatPage/DateDivider.tsx

import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatDateForDivider } from "../../utils/chatUtils"; // Adjust the import path as necessary

interface DateDividerProps {
  date: Date;
}

/**
 * DateDivider Component
 * Displays a divider with the formatted date to separate messages by date.
 *
 * @param {DateDividerProps} props - Component props.
 * @returns {JSX.Element | null} The rendered component or null if the date is invalid.
 */
const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  const { t } = useTranslation();

  // Validate the date object
  if (isNaN(date.getTime())) {
    // Skip rendering if date is invalid
    return null;
  }

  // Format the date using the utility function
  const formattedDate = formatDateForDivider(date);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        my: 2, // Vertical margin
      }}
      aria-label={t("dateDivider.labels.dateDivider", { date: formattedDate })}
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
          {formattedDate}
        </Typography>
      </Box>
    </Box>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(DateDivider);
