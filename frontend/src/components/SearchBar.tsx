import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  InputBase,
  IconButton,
  Paper,
  Box,
  CircularProgress,
  Fade,
  ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  forceExpanded?: boolean;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  loading = false,
  placeholder = 'Search patterns...',
  fullWidth = false,
  forceExpanded = false,
  initialQuery = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSearchedQueryRef = useRef<string>('');

  // Update query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Force expanded state when forceExpanded prop is true
  useEffect(() => {
    if (forceExpanded && !isExpanded) {
      setIsExpanded(true);
    }
  }, [forceExpanded, isExpanded]);

  // Create a debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (searchQuery === lastSearchedQueryRef.current) {
        return; // Don't search if the query hasn't changed
      }

      lastSearchedQueryRef.current = searchQuery;
      onSearch(searchQuery);
    },
    [onSearch],
  );

  // Use a custom debounce hook to prevent multiple calls
  const debouncedSearchHandler = useDebouncedCallback(debouncedSearch, 500);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.trim() === '') {
      // If query is empty, clear results immediately
      lastSearchedQueryRef.current = '';
      onSearch('');
    } else {
      // Otherwise, debounce the search
      debouncedSearchHandler(newQuery);
    }
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && query.trim() !== lastSearchedQueryRef.current) {
      lastSearchedQueryRef.current = query.trim();
      onSearch(query);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    lastSearchedQueryRef.current = '';
    onSearch('');
  };

  // Toggle search field visibility
  const handleToggleSearch = () => {
    setIsExpanded((prev) => !prev);
    // Focus the input when expanded
    if (!isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (!query) {
      // Clear search when collapsing with empty query
      handleClear();
    }
  };

  // Handle click away
  const handleClickAway = () => {
    // Only collapse if not forced to stay expanded and there's no query
    if (isExpanded && !query && !forceExpanded) {
      setIsExpanded(false);
      handleClear();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending debounced calls when component unmounts
      debouncedSearchHandler.cancel();
    };
  }, [debouncedSearchHandler]);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {!isExpanded ? (
          <IconButton
            onClick={handleToggleSearch}
            sx={{ color: 'primary.main' }}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <Fade in={isExpanded}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: fullWidth ? '100%' : 300,
                borderRadius: 2,
              }}
            >
              <IconButton sx={{ p: '10px' }} aria-label="search" onClick={handleSubmit}>
                <SearchIcon />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={placeholder}
                inputProps={{ 'aria-label': 'search patterns' }}
                value={query}
                onChange={handleChange}
                inputRef={inputRef}
              />
              {loading ? (
                <Box sx={{ p: '10px' }}>
                  <CircularProgress size={20} />
                </Box>
              ) : query ? (
                <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={handleClear}>
                  <ClearIcon />
                </IconButton>
              ) : (
                <IconButton sx={{ p: '10px' }} aria-label="close" onClick={handleToggleSearch}>
                  <ClearIcon />
                </IconButton>
              )}
            </Paper>
          </Fade>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
