// GlobalSearch.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store'; // Ensure this path matches your project structure
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { setQuery, searchItems } from '../../features/search/searchSlice';
import SearchResults from './SearchResults';
import './GlobalSearch.css';

interface GlobalSearchProps {
  filter?: string;
  onSelect?: (item: string) => void;
  placeholder?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ filter, onSelect, placeholder = "Search..." }) => {
  const [input, setInput] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const searchRef = useRef<HTMLDivElement>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    console.log('GlobalSearch handleSearch called');
    console.log('Query:', input);
    console.log('Filter:', filter);
    dispatch(setQuery(input));
    dispatch(searchItems({ query: input, filter }));
    setShowResults(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowResults(false);
    }
  };

  const handleSelect = (item: string) => {
    if (onSelect) {
      onSelect(item);
    }
    setShowResults(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className="global-search-container">
      <div className="global-search d-flex align-items-center">
        <FontAwesomeIcon icon={faSearch} onClick={handleSearch} className="search-icon" />
        <input
          type="text"
          className="form-control search-bar"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
        />
      </div>
      {showResults && (
        <div className="search-results-container">
          <SearchResults onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
