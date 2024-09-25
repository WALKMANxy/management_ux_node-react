// src/components/promosPage/PromosSidebar.tsx

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import usePromos from "../../hooks/usePromos";
import { Promo } from "../../models/dataModels";

interface PromosSidebarProps {
  onCreatePromo: () => void;
  onSelectPromo: (promo: Promo) => void;
}

const PromosSidebar: React.FC<PromosSidebarProps> = ({
  onCreatePromo,
  onSelectPromo,
}) => {
  const { t } = useTranslation();
  const { promos, selectedPromoId, handleRefreshPromos, userRole } =
    usePromos();
  const [searchTerm, setSearchTerm] = useState("");

  // Handle search input change
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  // Memoize filteredPromos to optimize performance
  const filteredPromos = useMemo(() => {
    return promos.filter((promo) =>
      promo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promos, searchTerm]);

  // Determine if a promo is active based on its end date
  const isPromoActive = useCallback((promo: Promo) => {
    return new Date(promo.endDate) > new Date();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with title and action buttons */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" gutterBottom>
          {t("promosSidebar.title", "Promos")}
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title={t("promosSidebar.refreshPromos", "Refresh Promos")}>
            <IconButton
              onClick={handleRefreshPromos}
              size="small"
              aria-label={t("promosSidebar.refreshPromos", "Refresh Promos")}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {userRole === "admin" && (
            <Tooltip title={t("promosSidebar.createPromo", "Create Promo")}>
              <IconButton
                onClick={onCreatePromo}
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

      {/* Search Bar */}
      <TextField
        variant="outlined"
        placeholder={t("promosSidebar.searchPlaceholder", "Search Promos")}
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: "25px",
          },
        }}
      />

      {/* List of Promos */}
      <List>
        {filteredPromos.length > 0 ? (
          filteredPromos.map((promo: Promo) => (
            <React.Fragment key={promo._id}>
              <ListItem
                button
                selected={selectedPromoId === promo._id}
                onClick={() => onSelectPromo(promo)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: isPromoActive(promo)
                    ? "rgba(144, 238, 144, 0.05)" // Faint green for active promos
                    : "rgba(255, 165, 0, 0.05)", // Faint orange for inactive promos
                  "&:hover": {
                    bgcolor: isPromoActive(promo)
                      ? "rgba(144, 238, 144, 0.2)"
                      : "rgba(255, 165, 0, 0.2)",
                  },
                  borderRadius: "12px", // Rounded corners
                  mb: 1, // Margin bottom for spacing
                }}
              >
                <ListItemAvatar>
                  <Avatar
/*                     sx={{ bgcolor: isPromoActive(promo) ? "orange" : "green" }}
 */                  >
                    {promo.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={promo.name}
                  secondary={`${t("promosSidebar.type", "Type")}: ${
                    promo.promoType
                  }`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}
          >
            {t("promosSidebar.noPromosFound", "No promos found.")}
          </Typography>
        )}
      </List>
    </Box>
  );
};

export default PromosSidebar;
