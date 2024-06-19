// src/components/common/GlobalSearch.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DOMPurify from 'dompurify';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { setQuery, searchItems } from '../../features/search/searchSlice';
import {  GlobalSearchProps } from '../../models/models';
import './GlobalSearch.css';
import SearchResults from './SearchResults';



const GlobalSearch: React.FC<GlobalSearchProps> = ({ filter = 'all', onSelect, placeholder = "Search..." }) => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const searchRef = useRef<HTMLDivElement>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const results = useSelector((state: RootState) => state.search.results);

  const handleSearch = useCallback(() => {
    const sanitizedInput = DOMPurify.sanitize(input.trim());
    if (sanitizedInput === '') {
      setShowResults(false);
      return;
    }
    dispatch(setQuery(sanitizedInput));
    dispatch(searchItems({ query: sanitizedInput, filter }));
    setShowResults(true);
  }, [dispatch, input, filter]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length && onSelect) {
        onSelect(results[selectedIndex].name);
        setShowResults(false);
        setSelectedIndex(-1);
      } else {
        handleSearch();
      }
    } else if (event.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => (prevIndex - 1 + results.length) % results.length);
    }
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  }, []);

  const handleSelect = (item: string) => {
    if (onSelect) {
      onSelect(item);
    }
    setShowResults(false);
    setInput('');
    setSelectedIndex(-1);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping) {
        handleSearch();
        setIsTyping(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [input, handleSearch, isTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setIsTyping(true);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    setShowResults(true);
    setSelectedIndex(-1); // Reset selectedIndex when focusing
  };

  return (
    <div ref={searchRef} className="global-search-container">
      <div className="global-search d-flex align-items-center">
        <div className="search-icon-wrapper">
          <FontAwesomeIcon icon={faSearch} onClick={handleSearch} className="search-icon" />
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
          <SearchResults onSelect={handleSelect} selectedIndex={selectedIndex} />
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
