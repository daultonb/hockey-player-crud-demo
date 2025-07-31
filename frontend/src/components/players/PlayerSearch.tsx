import React, { useState, useCallback } from 'react';
import { SEARCHABLE_FIELDS, SearchField } from '../../types/Player';
import './PlayerSearch.css';

interface PlayerSearchProps {
  onSearch: (query: string, field: SearchField) => void;
  onClear: () => void;
  disabled?: boolean;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  onSearch,
  onClear,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const performSearch = useCallback(
    (query: string, field: SearchField) => {
      console.log('PlayerSearch: Performing search -', { query, field });
      onSearch(query, field);
    },
    [onSearch]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value.trim() === '') {
      console.log('PlayerSearch: Search cleared, showing all players');
      onClear();
      return;
    }

    // Set up new debounce timer for real-time search
    const newTimer = setTimeout(() => {
      performSearch(value, searchField);
    }, 300); // 300ms debounce delay

    setDebounceTimer(newTimer);
  };

  const handleFieldChange = (field: SearchField) => {
    console.log('PlayerSearch: Search field changed to:', field);
    setSearchField(field);

    // Re-run search with new field if there's a query
    if (searchQuery.trim() !== '') {
      performSearch(searchQuery, field);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }

    if (searchQuery.trim() === '') {
      onClear();
    } else {
      performSearch(searchQuery, searchField);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit(e as any);
    }
  };

  const handleClearClick = () => {
    console.log('PlayerSearch: Clear button clicked');
    setSearchQuery('');
    onClear();

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  };

  return (
    <div className="player-search">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-group">
          <select
            value={searchField}
            onChange={e => handleFieldChange(e.target.value as SearchField)}
            className="search-field-selector"
            disabled={disabled}
            aria-label="Select search field"
          >
            {SEARCHABLE_FIELDS.map(field => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>

          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Search ${
                searchField === 'all'
                  ? 'all fields'
                  : SEARCHABLE_FIELDS.find(
                      f => f.value === searchField
                    )?.label.toLowerCase()
              }...`}
              className="search-input"
              disabled={disabled}
              aria-label="Search players"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClearClick}
                className="clear-button"
                aria-label="Clear search"
                disabled={disabled}
              >
                ×
              </button>
            )}
          </div>

          <button
            type="submit"
            className="search-button"
            disabled={disabled}
            aria-label="Search"
          >
            <svg
              className="search-icon"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerSearch;
