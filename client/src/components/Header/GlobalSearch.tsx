// src/components/GlobalSearch.tsx

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import React, { KeyboardEvent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useGlobalSearch from "../../hooks/useGlobalSearch";
import { GlobalSearchProps } from "../../models/propsModels";
import { SearchResult } from "../../models/searchModels";
import Spinner from "../common/Spinner";
import SearchResults from "./SearchResults";

const GlobalSearchContainer = styled(Box)(() => ({
  position: "relative",
  width: "100%",
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  width: "100%",
  "& .MuiInputBase-root": {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
}));

const SearchResultsContainer = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 10,
  maxHeight: 500,
  overflowY: "auto",
  marginTop: theme.spacing(1),
  backdropFilter: "blur(15px)", // Increased blur for a more pronounced frosted effect
  backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly more transparent for a frosty look
  borderRadius: "12px", // Rounded corners for a smoother look
  padding: theme.spacing(2),
  border: `1px solid rgba(255, 255, 255, 0.3)`, // Light border to enhance the frosted effect
  boxShadow: `0px 4px 12px rgba(0, 0, 0, 0.1)`, // Soft shadow for depth
  "&::-webkit-scrollbar": {
    display: "none",
  },
}));

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  filter = "all",
  onSelect,
  placeholder,
  isHeaderSearch = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    input,
    handleChange,
    handleFocus,
    showResults,
    searchRef,
    results,
    selectedIndex,
    setShowResults,
    setSelectedIndex,
    status,
  } = useGlobalSearch(filter);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      if (isHeaderSearch) {
        sessionStorage.setItem("searchedItem", JSON.stringify(item));
        switch (item.type) {
          case "article":
            navigate("/articles");
            break;
          case "client":
            navigate("/clients");
            break;
          case "promo":
            navigate("/promotions"); // Assuming you have a promotions route
            break;
          default:
            navigate("/");
            break;
        }
      } else if (onSelect) {
        onSelect(item);
      }
      setShowResults(false);
      setSelectedIndex(-1);
    },
    [isHeaderSearch, navigate, onSelect, setShowResults, setSelectedIndex]
  );

  const handleKeyDownWrapper = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          Math.min(prevIndex + 1, results.length - 1)
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        break;
      case "Enter":
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        } else {
          // If no item is selected, perform the search
          // Optionally, you can prevent the default behavior here
          event.preventDefault();
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
      default:
        // No default action
        break;
    }
  };
  return (
    <GlobalSearchContainer ref={searchRef}>
      <SearchInput
        variant="outlined"
        placeholder={placeholder || t("globalSearch.placeholder", "Search...")}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDownWrapper}
        onFocus={handleFocus}
        autoComplete="off"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "24px", // Set the border radius here
            height: 45, // Adjust height if needed
            padding: "6px 8px", // Adjust padding if needed
          },
          "& .MuiInputBase-input": {
            fontSize: "1rem", // Adjust font size if needed
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FontAwesomeIcon
                icon={faSearch}
                color={theme.palette.text.disabled}
              />
            </InputAdornment>
          ),
          "aria-label": t("globalSearch.ariaLabel", "Search"),
        }}
      />
      {showResults && (
        <SearchResultsContainer elevation={3}>
          {status === "loading" ? (
            <Box sx={{ p: 2 }}>
              <Spinner />
            </Box>
          ) : results.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" color="textSecondary">
                {t("globalSearch.noResults", "No results found.")}
              </Typography>
            </Box>
          ) : (
            <SearchResults
              onSelect={handleSelect}
              selectedIndex={selectedIndex}
              results={results}
            />
          )}
        </SearchResultsContainer>
      )}
    </GlobalSearchContainer>
  );
};

export default React.memo(GlobalSearch);
