import React, { useState, useRef, useCallback, useEffect } from 'react';
import useSearchPatterns from './useSearchPatterns';
import { Tables } from '@/types/database';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';

interface UseSearchReturn {
  searchContainerRef: React.RefObject<HTMLDivElement>;
  searchResults: Tables<'patterns'>[] | null;
  searchLoading: boolean;
  searchError: string | null;
  isSearching: boolean;
  handleSearch: (query: string) => void;
  SearchComponent: React.FC<{
    onSelect?: (pattern: Tables<'patterns'>) => void;
    preventNavigation?: boolean;
    forceExpanded?: boolean;
  }>;
  currentQuery: string;
}

export default function useSearch(): UseSearchReturn {
  const {
    searchPatterns,
    searchResults,
    loading: searchLoading,
    error: searchError,
    clearResults,
  } = useSearchPatterns();
  const [isSearching, setIsSearching] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const lastSearchQueryRef = useRef<string>('');

  useEffect(() => {
    // Set searching state based on search results
    setIsSearching(searchResults !== null && searchResults.length > 0);
  }, [searchResults]);

  // Memoize the search handler to prevent recreating it on each render
  const handleSearch = useCallback(
    (query: string) => {
      // Update the current query state
      setCurrentQuery(query);

      // Only search if the query has changed
      if (query.trim() === lastSearchQueryRef.current) {
        return;
      }

      lastSearchQueryRef.current = query.trim();

      if (query.trim() === '') {
        clearResults();
        return;
      }

      searchPatterns(query);
    },
    [clearResults, searchPatterns],
  );

  // Create a component that renders the search UI
  const SearchComponent = useCallback(
    ({
      onSelect,
      preventNavigation,
      forceExpanded,
    }: {
      onSelect?: (pattern: Tables<'patterns'>) => void;
      preventNavigation?: boolean;
      forceExpanded?: boolean;
    }) => {
      return (
        <div ref={searchContainerRef} style={{ position: 'relative' }}>
          <SearchBar
            onSearch={handleSearch}
            loading={searchLoading}
            forceExpanded={forceExpanded || isSearching || currentQuery.length > 0}
            initialQuery={selectedValue || currentQuery}
          />
          {isSearching && (
            <SearchResults
              results={searchResults}
              loading={searchLoading}
              error={searchError}
              anchorEl={searchContainerRef.current}
              onSelect={(pattern) => {
                setSelectedValue(pattern.name);
                onSelect?.(pattern);
                clearResults();
              }}
              preventNavigation={preventNavigation}
            />
          )}
        </div>
      );
    },
    [
      handleSearch,
      isSearching,
      searchError,
      searchLoading,
      searchResults,
      currentQuery,
      selectedValue,
      clearResults,
    ],
  );

  return {
    searchContainerRef,
    searchResults,
    searchLoading,
    searchError,
    isSearching,
    handleSearch,
    SearchComponent,
    currentQuery,
  };
}
