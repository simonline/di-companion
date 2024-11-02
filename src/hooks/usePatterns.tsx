import { useState, useCallback } from 'react';
import { strapiGetPatterns } from '@/lib/strapi';
import type { Pattern } from '@/types/strapi';

interface UsePatterns {
  patterns: Pattern[] | null;
  loading: boolean;
  error: string | null;
}

interface UsePatternsReturn extends UsePatterns {
  fetchPatterns: () => void;
  clearError: () => void;
}

export default function usePatterns(): UsePatternsReturn {
  const [state, setState] = useState<UsePatterns>({
    patterns: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchPatterns = useCallback(async () => {
    try {
      const patterns = await strapiGetPatterns();
      setState({ patterns, loading: false, error: null });
    } catch (error) {
      setState({ patterns: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchPatterns,
    patterns: state.patterns,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
