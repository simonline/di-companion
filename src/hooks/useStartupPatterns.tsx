import { useState, useCallback } from 'react';
import { strapiGetStartupPatterns } from '@/lib/strapi';
import type { StartupPattern } from '@/types/strapi';

interface UseStartupPatterns {
  startupPatterns: StartupPattern[] | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupPatternsReturn extends UseStartupPatterns {
  fetchStartupPatterns: () => void;
  clearError: () => void;
}

export default function useStartupPatterns(): UseStartupPatternsReturn {
  const [state, setState] = useState<UseStartupPatterns>({
    startupPatterns: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartupPatterns = useCallback(async () => {
    try {
      const startupPatterns = await strapiGetStartupPatterns();
      setState({ startupPatterns, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupPatterns: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchStartupPatterns,
    startupPatterns: state.startupPatterns,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
