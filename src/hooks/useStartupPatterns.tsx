import { useState, useCallback } from 'react';
import { strapiGetStartupPatterns } from '@/lib/strapi';
import type { StartupPattern } from '@/types/strapi';
import { useAuth } from '@/hooks/useAuth';

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
  const { startup } = useAuth();

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
      const startupPatterns = await strapiGetStartupPatterns(startup?.documentId as string);
      setState({ startupPatterns, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupPatterns: null, loading: false, error: error.message });
    }
  }, [startup?.documentId]);

  return {
    fetchStartupPatterns,
    startupPatterns: state.startupPatterns,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
