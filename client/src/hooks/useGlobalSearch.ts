// src/hooks/useGlobalSearch.ts
import DOMPurify from "dompurify";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import {
  clearResults,
  searchItems,
  setQuery,
} from "../features/search/searchSlice";
import useDebounce from "./useDebounce";

const useGlobalSearch = (filter: string) => {
  const [input, setInput] = useState("");
  const dispatch = useAppDispatch();
  const searchRef = useRef<HTMLDivElement>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedInput = useDebounce(input, 300);
  const results = useAppSelector((state: RootState) => state.search.results);
  const status = useAppSelector((state: RootState) => state.search.status);

  const handleSearch = useCallback(() => {
    const sanitizedInput = DOMPurify.sanitize(debouncedInput.trim());
    //console.log("handleSearch - Sanitized input:", sanitizedInput);
    if (sanitizedInput === "" || sanitizedInput.length < 3) {
      dispatch(clearResults());
      setShowResults(false);
      return;
    }
    //console.log("handleSearch - Dispatching searchItems with query:", sanitizedInput);
    dispatch(setQuery(sanitizedInput));
    dispatch(searchItems({ query: sanitizedInput, filter }));
    setShowResults(true);
  }, [dispatch, debouncedInput, filter]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setShowResults(false);
      setSelectedIndex(-1);
      //console.log("handleClickOutside - Click outside detected, hiding results");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    if (input.length >= 3) {
      handleSearch();
    } else {
      dispatch(clearResults());
    }
    setShowResults(true);
  };

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
