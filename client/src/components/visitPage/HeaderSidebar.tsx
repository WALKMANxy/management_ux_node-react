//src/components/visitPage/HeaderSidebar.tsx
import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  userRole: string;
  selectedAgentId: string | null;
  handleBackToAgents: () => void;
  handleVisitsRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userRole,
  selectedAgentId,
  handleBackToAgents,
  handleVisitsRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Box display="flex" alignItems="center">
        {userRole === "admin" && selectedAgentId && (
          <Tooltip title={t("visitsSidebar.goBackTooltip", "Go back to Agents")} arrow>
            <IconButton
              onClick={handleBackToAgents}
              size="small"
              aria-label={t("visitsSidebar.goBack", "Go Back")}
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Typography variant="h5">
          {userRole === "admin"
            ? selectedAgentId
              ? t("visitsSidebar.clients", "Clients")
              : t("visitsSidebar.agents", "Agents")
            : t("visitsSidebar.visits", "Visits")}
        </Typography>
      </Box>
      {(userRole === "admin" || userRole === "agent") && (
        <Tooltip title={t("visitsSidebar.refreshTooltip", "Refresh Visits")} arrow>
          <IconButton
            onClick={handleVisitsRefresh}
            aria-label={t("visitsSidebar.refresh", "Refresh Visits")}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default React.memo(Header);
