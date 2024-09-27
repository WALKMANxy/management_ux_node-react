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
import { showToast } from "../utils/toastMessage";
import useDebounce from "./useDebounce";

const useGlobalSearch = (filter: string) => {
  const { t } = useTranslation(); // Initialize translation
  const dispatch = useAppDispatch();

  const [input, setInput] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null); // Error state

  const debouncedInput = useDebounce(input, 300);
  const results = useAppSelector((state: RootState) => state.search.results);
  const status = useAppSelector((state: RootState) => state.search.status);

  // Error Handling: Display toast when an error occurs
  useEffect(() => {
    if (error) {
      showToast.error(error);
      setError(null); // Reset error after displaying
    }
  }, [error]);

  // Handle search logic
  const handleSearch = useCallback(async () => {
    const sanitizedInput = DOMPurify.sanitize(debouncedInput.trim());

    if (sanitizedInput === "" || sanitizedInput.length < 3) {
      dispatch(clearResults());
      setShowResults(false);
      return;
    }

    dispatch(setQuery(sanitizedInput));

    try {
      await dispatch(searchItems({ query: sanitizedInput, filter })).unwrap();
      setShowResults(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Search error:", err);
      const errorMessage = err.message || t("errors.searchFailed");
      setError(errorMessage);
    }
  }, [dispatch, debouncedInput, filter, t]);

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
      setSelectedIndex(0); // Highlight the first item
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
