//src/components/visitPage/StatusIndicatorSidebar.tsx
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Tooltip } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface StatusIndicatorProps {
  type: "pending" | "incomplete";
  count?: number;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ type, count }) => {
  const { t } = useTranslation();
  const isClient = typeof count === "number";
  const tooltipText =
    type === "pending"
      ? isClient
        ? t("visitsSidebar.pendingCount", "{{count}} Pending Visits", { count })
        : t("visitsSidebar.pendingVisits", "Has Pending Visits")
      : isClient
      ? t("visitsSidebar.incompleteCount", "{{count}} Incomplete Visits", {
          count,
        })
      : t("visitsSidebar.incompleteVisits", "Has Incomplete Visits");

  const backgroundColor = type === "pending" ? "lightgreen" : "lightcoral";

  return (
    <Tooltip title={tooltipText} arrow>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isClient ? count : <ErrorIcon fontSize="small" />}
      </Box>
    </Tooltip>
  );
};

export default React.memo(StatusIndicator);
