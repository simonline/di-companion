import { useState, useCallback } from 'react';
import {
  strapiGetStartupPattern,
  strapiCreateStartupPattern,
  strapiUpdateStartupPattern,
} from '@/lib/strapi';
import type { StartupPattern, CreateStartupPattern, UpdateStartupPattern } from '@/types/strapi';

interface UseStartupPattern {
  startupPattern: StartupPattern | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupPatternReturn extends UseStartupPattern {
  fetchStartupPattern: (documentId: string) => void;
  createStartupPattern: (createStartupPattern: CreateStartupPattern) => void;
  updateStartupPattern: (updateStartupPattern: UpdateStartupPattern) => void;
  clearError: () => void;
}

export default function useStartupPattern(): UseStartupPatternReturn {
  const [state, setState] = useState<UseStartupPattern>({
    startupPattern: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartupPattern = useCallback(async (documentId: string) => {
    try {
      const startupPattern = await strapiGetStartupPattern(documentId);
      setState({ startupPattern, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupPattern: null, loading: false, error: error.message });
    }
  }, []);

  const createStartupPattern = useCallback(async (createStartupPattern: CreateStartupPattern) => {
    try {
      const startupPattern = await strapiCreateStartupPattern(createStartupPattern);
      setState({ startupPattern, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupPattern: null, loading: false, error: error.message });
    }
  }, []);

  const updateStartupPattern = useCallback(async (updateStartupPattern: UpdateStartupPattern) => {
    try {
      const startupPattern = await strapiUpdateStartupPattern(updateStartupPattern);
      setState({ startupPattern, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupPattern: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchStartupPattern,
    createStartupPattern,
    updateStartupPattern,
    startupPattern: state.startupPattern,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
