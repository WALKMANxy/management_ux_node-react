// src/components/promosPage/PromosSidebar.tsx
import { Box, List, Typography, useTheme } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import usePromos from "../../hooks/usePromos";
import { Promo } from "../../models/dataModels";
import HeaderSidebar from "./HeaderSidebar";
import SearchBarSidebar from "./SearchBarSidebar";
import SidebarList from "./SidebarList";

interface PromosSidebarProps {
  onCreatePromo: () => void;
  onSelectPromo: (promoId: string) => void;
}

const PromosSidebar: React.FC<PromosSidebarProps> = ({
  onCreatePromo,
  onSelectPromo,
}) => {
  const { t } = useTranslation();
  const {
    selectedPromoId,
    handleRefreshPromos,
    userRole,
    handleSearchChange,
    filteredPromos,
    searchTerm,
    isPromoActive,
  } = usePromos();

  const theme = useTheme();
  const isMobile = theme.breakpoints.down("sm");

  const promosWithActiveStatus = useMemo(
    () =>
      filteredPromos.map((promo) => ({
        promo,
        isActive: isPromoActive(promo),
      })),
    [filteredPromos, isPromoActive]
  );

  const handleSelectPromo = useCallback(
    (promo: Promo) => {
      onSelectPromo(promo._id!);
    },
    [onSelectPromo]
  );

  return (
    <Box
      sx={{
        pt: 2,
        px: 2,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",

      }}
    >
      {/* Header with title and action buttons */}
      <HeaderSidebar
        userRole={userRole!}
        onRefresh={handleRefreshPromos}
        handleCreatePromo={onCreatePromo}
      />

      {/* Search Bar */}
      <SearchBarSidebar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* List of Promos */}
      <Box
        sx={{
          height: isMobile ? "79vh" : "100%",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none", 
          },
        }}
      >
        {promosWithActiveStatus.length > 0 ? (
          <List>
            {promosWithActiveStatus.map(({ promo, isActive }) => (
              <SidebarList
                key={promo._id}
                promo={promo}
                isSelected={selectedPromoId === promo._id}
                onSelect={handleSelectPromo}
                isActive={isActive}
              />
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}
          >
            {t("promosSidebar.noPromosFound", "No promos found.")}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(PromosSidebar);
