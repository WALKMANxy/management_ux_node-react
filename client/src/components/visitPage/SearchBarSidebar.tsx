// SearchBar.tsx
import React, { ChangeEvent } from "react";
import { TextField, InputAdornment, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  userRole: string;
  selectedAgentId: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  userRole,
  selectedAgentId,
  searchTerm,
  setSearchTerm,
}) => {
  const { t } = useTranslation();

  const placeholder =
    userRole === "admin" && !selectedAgentId
      ? t("visitsSidebar.searchAgents", "Search Agents")
      : t("visitsSidebar.searchClients", "Search Clients");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Tooltip title={t("visitsSidebar.searchTooltip", "Search")} arrow>
      <TextField
        variant="outlined"
        placeholder={placeholder}
        fullWidth
        value={searchTerm}
        onChange={handleChange}
        type="search"
        autoComplete="off"
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
