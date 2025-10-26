import React, { useCallback, useState } from "react";
import { SEARCHABLE_FIELDS, SearchField } from "../../types/Player";
import "./PlayerSearch.css";

interface PlayerSearchProps {
  onSearch: (query: string, field: SearchField) => void;
  onClear: () => void;
  onOpenFilters: () => void;
  disabled?: boolean;
  activeFiltersCount?: number;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  onSearch,
  onClear,
  onOpenFilters,
  disabled = false,
  activeFiltersCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<SearchField>("all");
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const performSearch = useCallback(
    (query: string, field: SearchField) => {
      onSearch(query, field);
    },
    [onSearch]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value.trim() === "") {
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
    setSearchField(field);

    if (searchQuery.trim() !== "") {
      performSearch(searchQuery, field);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }

    if (searchQuery.trim() === "") {
      onClear();
    } else {
      performSearch(searchQuery, searchField);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit(e as any);
    }
  };

  const handleClearClick = () => {
    setSearchQuery("");
    onClear();

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  };

  const handleFilterClick = () => {
    onOpenFilters();
  };

  return (
    <div className="player-search">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-group">
          <select
            value={searchField}
            onChange={(e) => handleFieldChange(e.target.value as SearchField)}
            className="search-field-selector"
            disabled={disabled}
            aria-label="Select search field"
          >
            {SEARCHABLE_FIELDS.map((field) => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>

          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Search ${
                searchField === "all"
                  ? "all fields"
                  : SEARCHABLE_FIELDS.find(
                      (f) => f.value === searchField
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

          <button
            type="button"
            className={`filter-button ${
              activeFiltersCount > 0 ? "has-filters" : ""
            }`}
            onClick={handleFilterClick}
            disabled={disabled}
            aria-label={`Open filters${
              activeFiltersCount > 0 ? ` (${activeFiltersCount} active)` : ""
            }`}
            title={`Filter players${
              activeFiltersCount > 0 ? ` (${activeFiltersCount} active)` : ""
            }`}
          >
            <svg
              className="filter-icon"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            {activeFiltersCount > 0 && (
              <span className="filter-count">{activeFiltersCount}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerSearch;
