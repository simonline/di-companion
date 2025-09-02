import { useState, useCallback, useRef } from 'react';
import { Pattern } from '@/types/database';
import { supabase } from '@/lib/supabase';

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
      // Use Supabase to search patterns - no token check needed
      const { data, error: searchError } = await supabase
        .from('patterns')
        .select(`
          *,
          related_patterns:patterns_related_patterns_lnk!patterns_related_patterns_lnk_fk(
            related:patterns!inv_pattern_id(*)
          ),
          methods:methods_patterns_lnk(
            method:methods(*)
          ),
          survey:patterns_survey_lnk(
            survey:surveys(*)
          ),
          questions:questions_patterns_lnk(
            question:questions(*)
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      // If this request was aborted, don't proceed
      if (abortController.signal.aborted) {
        return;
      }

      if (searchError) {
        throw new Error(searchError.message || 'Search failed');
      }

      // Transform the data to match the expected format
      const transformedData = (data || []).map((pattern: any) => {
        // Get image URL from the joined file record using backend endpoint
        const imageUrl = pattern.image_id ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/files/${pattern.image_id}` : '';

        // Transform related_patterns to extract the nested pattern objects
        const transformedRelatedPatterns = pattern.related_patterns?.map((rel: any) => rel.related) || [];

        return {
          ...pattern,
          image: { url: imageUrl },
          related_patterns: transformedRelatedPatterns,
        };
      });

      // Only update state if this is still the active request
      if (activeRequestRef.current === abortController) {
        setSearchResults(transformedData);
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
