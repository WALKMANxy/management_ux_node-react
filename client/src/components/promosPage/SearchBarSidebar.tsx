// src/components/promosPage/SearchBar.tsx
import React, { ChangeEvent } from "react";
import { TextField, InputAdornment, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}


const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  const { t } = useTranslation();



  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e);
  };



  return (
    <Tooltip title={t("promosSidebar.searchTooltip", "Search Promos")} arrow>
      <TextField
        variant="outlined"
        placeholder={t("promosSidebar.searchPlaceholder", "Search Promos")}
        fullWidth
        defaultValue={searchTerm}
        onChange={handleChange}
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
    </Tooltip>
  );
};

export default React.memo(SearchBar);
