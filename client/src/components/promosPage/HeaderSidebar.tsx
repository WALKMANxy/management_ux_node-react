// src/components/promosPage/Header.tsx
import React from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import { UserRole } from "../../models/entityModels";

interface HeaderProps {
  userRole: UserRole;
  onRefresh: () => void;
  handleCreatePromo: () => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, onRefresh, handleCreatePromo }) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h5" gutterBottom>
        {t("promosSidebar.title", "Promos")}
      </Typography>
      <Box display="flex" gap={1}>
        <Tooltip title={t("promosSidebar.refreshPromos", "Refresh Promos")} arrow>
          <IconButton
            onClick={onRefresh}
            size="small"
            aria-label={t("promosSidebar.refreshPromos", "Refresh Promos")}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        {userRole === "admin" && (
          <Tooltip title={t("promosSidebar.createPromo", "Create Promo")} arrow>
            <IconButton
              onClick={handleCreatePromo}
              size="small"
              color="primary"
              aria-label={t("promosSidebar.createPromo", "Create Promo")}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(Header);
