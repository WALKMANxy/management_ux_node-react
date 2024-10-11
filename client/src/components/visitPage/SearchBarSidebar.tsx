import React, { ChangeEvent, useEffect, useState } from "react";
import { TextField, InputAdornment, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import useDebounce from "../../hooks/useDebounce";

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

  // Declare the input state to handle the TextField value
  const [input, setInput] = useState(searchTerm);

  // Debounce the input value
  const debouncedInput = useDebounce(input, 300);

  // Handle input changes and set the input state
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Update the searchTerm after debounced input changes
  useEffect(() => {
    setSearchTerm(debouncedInput);
  }, [debouncedInput, setSearchTerm]);

  // Determine placeholder based on role and agent selection
  const placeholder =
    userRole === "admin" && !selectedAgentId
      ? t("visitsSidebar.searchAgents", "Search Agents")
      : t("visitsSidebar.searchClients", "Search Clients");

  return (
    <Tooltip title={t("visitsSidebar.searchTooltip", "Search")} arrow>
      <TextField
        variant="outlined"
        placeholder={placeholder}
        fullWidth
        value={input} // Use input state for value
        onChange={handleChange} // Update input state on change
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
