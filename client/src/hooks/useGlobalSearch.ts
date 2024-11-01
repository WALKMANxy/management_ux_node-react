/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useGlobalSearch.ts
import DOMPurify from "dompurify";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import {
  clearResults,
  searchItems,
  setQuery,
} from "../features/search/searchSlice";
import { showToast } from "../services/toastMessage";
import useDebounce from "./useDebounce";

const useGlobalSearch = (filter: string) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [input, setInput] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const debouncedInput = useDebounce(input, 300);
  const results = useAppSelector((state: RootState) => state.search.results);
  const status = useAppSelector((state: RootState) => state.search.status);

  // Error Handling: Display toast when an error occurs
  useEffect(() => {
    if (error) {
      showToast.error(error);
      setError(null);
    }
  }, [error]);

  // Function to parse modifiers and exact matches
  const parseSearchTerm = useCallback(
    (searchTerm: string) => {
      let typeFilter: string | null = null;
      let exactMatch = false;
      let actualQuery = searchTerm;

      const modifierRegex = /^(C_|A_|P_|V_)/i;
      const exactMatchRegex = /^"(.+)"$/;

      // Check for exact match
      const exactMatchMatch = searchTerm.match(exactMatchRegex);
      if (exactMatchMatch) {
        exactMatch = true;
        actualQuery = exactMatchMatch[1].trim();
      }

      // Check for type modifier
      const modifierMatch = actualQuery.match(modifierRegex);
      if (modifierMatch) {
        typeFilter = modifierMatch[1].toLowerCase();
        actualQuery = actualQuery.slice(modifierMatch[1].length).trim();
      }

      // Determine the filter based on modifier
      let finalFilter = filter; // Default to initial filter
      if (typeFilter) {
        switch (typeFilter) {
          case "c_":
            finalFilter = "client";
            break;
          case "a_":
            finalFilter = "article";
            break;
          case "p_":
            finalFilter = "promo";
            break;
          case "v_":
            finalFilter = "visit";
            break;
          default:
            finalFilter = filter; // Fallback to 'all' if unknown modifier
            break;
        }
      }

      return { query: actualQuery, filter: finalFilter, exact: exactMatch };
    },
    [filter]
  );

  // Handle search logic
  const handleSearch = useCallback(async () => {
    const sanitizedInput = DOMPurify.sanitize(debouncedInput.trim());

    if (sanitizedInput === "") {
      dispatch(clearResults());
      setShowResults(false);
      return;
    }

    // Parse the input for modifiers and exact matches
    const { query, filter, exact } = parseSearchTerm(sanitizedInput);

    // Update the query in the state
    dispatch(setQuery(query));

    try {
      // Dispatch the search action with extended parameters
      await dispatch(searchItems({ query, filter, exact })).unwrap();
      setShowResults(true);
    } catch (err: any) {
      console.error("Search error:", err);
      const errorMessage = err.message || t("errors.searchFailed");
      setError(errorMessage);
    }
  }, [dispatch, debouncedInput, parseSearchTerm, t]);

  // Handle clicks outside the search component
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    handleSearch();
  }, [debouncedInput, handleSearch]);

  // Reset selectedIndex when results change
  useEffect(() => {
    if (results.length > 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(-1);
    }
  }, [results]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSelectedIndex(-1);
  }, []);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (input.length >= 3) {
      handleSearch();
    } else {
      dispatch(clearResults());
    }
    setShowResults(true);
  }, [input.length, handleSearch, dispatch]);

  return {
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
  };
};

export default useGlobalSearch;
