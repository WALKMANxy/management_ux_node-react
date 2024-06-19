// src/components/common/SearchResults.tsx
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { SearchResultsProps } from '../../models/models';
import './SearchResults.module.css';

const SearchResults: React.FC<SearchResultsProps> = ({ onSelect, selectedIndex }) => {
  const { results, status, error } = useSelector((state: RootState) => state.search);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (status === 'loading') {
    return <div className="search-results">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="search-results">Error: {error}</div>;
  }

  return (
    <div className="search-results" ref={resultsRef}>
      {results.length > 0 ? (
        results.map((result, index) => (
          <div
            key={result.id}
            className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelect && onSelect(result.name)}
          >
            <p>{result.name}</p>
            <small>Type: {result.type}</small>
          </div>
        ))
      ) : (
        <div className="search-result-item">No results found</div>
      )}
    </div>
  );
};

export default SearchResults;
