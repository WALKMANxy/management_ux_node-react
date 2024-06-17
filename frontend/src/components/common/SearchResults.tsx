// SearchResults.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import './SearchResults.module.css';

interface SearchResultsProps {
  onSelect?: (item: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ onSelect }) => {
  const { results, status, error } = useSelector((state: RootState) => state.search);

  if (status === 'loading') {
    return <div className="search-results">Loading...</div>;
  }

  if (status === 'failed') {
    return <div className="search-results">Error: {error}</div>;
  }

  return (
    <div className="search-results">
      {results.length > 0 ? (
        results.map((result) => (
          <div
            key={result.id}
            className="search-result-item"
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
