// src/components/chatPage/DateDivider.tsx
import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatDateForDivider } from "../../utils/chatUtils"; // Adjust the import path as necessary

interface DateDividerProps {
  date: Date;
}

const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  const { t } = useTranslation();

  // Validate the date object
  if (isNaN(date.getTime())) {
    return null;
  }

  // Format the date using the utility function
  const formattedDate = formatDateForDivider(date);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        my: 2,
      }}
      aria-label={t("dateDivider.labels.dateDivider", { date: formattedDate })}
    >
      <Box
        sx={{
          bgcolor: "#e0e0e0",
          px: 2,
          py: 0.5,
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
export default React.memo(DateDivider);
