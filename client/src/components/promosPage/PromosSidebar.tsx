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
  Typography,
} from "@mui/material";
import React, { useState } from "react";
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredPromos = promos.filter((promo) =>
    promo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPromoActive = (promo: Promo) => {
    return new Date(promo.endDate) > new Date();
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with title and create button */}
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
          <IconButton onClick={handleRefreshPromos} size="small">
            <RefreshIcon />
          </IconButton>
          {userRole === "admin" && (
            <IconButton onClick={onCreatePromo} size="small" color="primary">
              <AddIcon />
            </IconButton>
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
                    ? "rgba(0, 255, 0, 0.1)"
                    : "grey.300",
                  "&:hover": {
                    bgcolor: isPromoActive(promo)
                      ? "rgba(0, 255, 0, 0.2)"
                      : "grey.400",
                  },
                  borderRadius: "12px", // Add border radius for rounded corners
                }}
              >
                <ListItemAvatar>
                  <Avatar>{promo.name.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={promo.name}
                  secondary={`${t("promosSidebar.type")}: ${promo.promoType}`}
                />
              </ListItem>
              <Divider sx={{ my: 1 }} />
            </React.Fragment>
          ))
        ) : (
          <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
            {t("promosSidebar.noPromosFound", "No promos found.")}
          </Typography>
        )}
      </List>
    </Box>
  );
};

export default PromosSidebar;
