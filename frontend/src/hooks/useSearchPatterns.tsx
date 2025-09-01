import { useState, useCallback, useRef } from 'react';
import { Pattern } from '@/types/database';

interface UseSearchPatternsReturn {
  searchPatterns: (query: string) => Promise<void>;
  searchResults: Pattern[] | null;
  loading: boolean;
  error: string | null;
  clearResults: () => void;
}

export default function useSearchPatterns(): UseSearchPatternsReturn {
  const [searchResults, setSearchResults] = useState<Pattern[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');

  const searchPatterns = useCallback(async (query: string) => {
    // Don't search if the query is the same as the last one
    if (query.trim() === lastQueryRef.current) {
      return;
    }

    // Save the current query
    lastQueryRef.current = query.trim();

    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    // Cancel any ongoing request
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    // Create a new abort controller for this request
    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('strapi_jwt');
      if (!token) {
        throw new Error('Unauthorized');
      }

      // Create a search URL with the query parameter
      const STRAPI_API_PREFIX = '/api';
      let endpoint = '/patterns?';
      endpoint += '&populate[relatedPatterns][populate]=*';
      endpoint += '&populate[methods][populate]=*';
      endpoint += '&populate[image][fields][0]=url';
      endpoint += '&populate[survey][fields][0]=id';
      endpoint += `&filters[$or][0][name][$containsi]=${encodeURIComponent(query)}`;
      endpoint += `&filters[$or][1][description][$containsi]=${encodeURIComponent(query)}`;

      const url = `${import.meta.env.VITE_API_URL}${STRAPI_API_PREFIX}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: abortController.signal,
      });

      // If this request was aborted, don't proceed
      if (abortController.signal.aborted) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = (await response.json()) as { data: Pattern[] };

      // Only update state if this is still the active request
      if (activeRequestRef.current === abortController) {
        setSearchResults(data.data || []);
      }
    } catch (error) {
      // Only update error state if this wasn't an abort error and is still the active request
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      console.error('Search error:', error);
      setError('Failed to search patterns');
    } finally {
      // Only update loading state if this is still the active request
      if (activeRequestRef.current === abortController) {
        setLoading(false);
        activeRequestRef.current = null;
      }
    }
  }, []);

  const clearResults = useCallback(() => {
    // Cancel any ongoing request
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }

    lastQueryRef.current = '';
    setSearchResults(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    searchPatterns,
    searchResults,
    loading,
    error,
    clearResults,
  };
}
