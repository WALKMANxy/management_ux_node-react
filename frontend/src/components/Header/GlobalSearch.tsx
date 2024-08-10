import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useGlobalSearch from "../../hooks/useGlobalSearch";
import { GlobalSearchProps } from "../../models/propsModels";
import { SearchResult } from "../../models/searchModels";
import Spinner from "../common/Spinner";
import "./GlobalSearch.css";
import SearchResults from "./SearchResults";

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  filter = "all",
  onSelect,
  placeholder,
  isHeaderSearch = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    input,
    handleChange,
    handleKeyDown,
    handleFocus,
    showResults,
    searchRef,
    results,
    selectedIndex,
    setShowResults,
    setSelectedIndex,
    status, // Add status to the destructured properties
  } = useGlobalSearch(filter);

  const handleSelect = (item: SearchResult) => {
    if (isHeaderSearch) {
      sessionStorage.setItem("searchedItem", JSON.stringify(item));
      if (item.type === "article") {
        navigate("/articles");
      } else if (item.type === "client") {
        navigate("/clients");
      }
    } else if (onSelect) {
      onSelect(item); // Call the provided onSelect callback
    }
    setShowResults(false);
    setSelectedIndex(-1);
  };

  return (
    <div ref={searchRef} className="global-search-container">
      <div className="global-search d-flex align-items-center">
        <div className="search-icon-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
        <input
          type="text"
          className="form-control search-bar"
          placeholder={placeholder || t("globalSearch.placeholder")}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
        />
      </div>
      {showResults && (
        <div className="search-results-container">
          {status === "loading" ? (
            <Spinner /> // Show the spinner when the search is loading
          ) : (
            <SearchResults
              onSelect={handleSelect}
              selectedIndex={selectedIndex}
              results={results}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
