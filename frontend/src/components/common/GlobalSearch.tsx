// src/components/common/GlobalSearch.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchResults from "./SearchResults";
import useGlobalSearch from "../../hooks/useGlobalSearch";
import { GlobalSearchProps } from "../../models/models";
import "./GlobalSearch.css";

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  filter = "all",
  onSelect,
  placeholder = "Search...",
}) => {
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
  } = useGlobalSearch(filter);

  const handleSelect = (item: string) => {
    if (onSelect) {
      onSelect(item);
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
          placeholder={placeholder}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
        />
      </div>
      {showResults && (
        <div className="search-results-container">
          <SearchResults
            onSelect={handleSelect}
            selectedIndex={selectedIndex}
            results={results}
          />
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
