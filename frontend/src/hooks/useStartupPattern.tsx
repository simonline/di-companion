import { useState, useCallback } from 'react';
import {
  supabaseGetStartupPattern,
  supabaseCreateStartupPattern,
  supabaseUpdateStartupPattern,
} from '@/lib/supabase';
import { StartupPattern, StartupPatternCreate, StartupPatternUpdate } from '@/types/database';

interface UseStartupPattern {
  startupPattern: StartupPattern | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupPatternReturn extends UseStartupPattern {
  fetchStartupPattern: (id: string) => void;
  createStartupPattern: (createStartupPattern: StartupPatternCreate) => void;
  updateStartupPattern: (updateStartupPattern: StartupPatternUpdate) => void;
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

  const fetchStartupPattern = useCallback(async (id: string) => {
    try {
      const startupPattern = await supabaseGetStartupPattern(id);
      setState({ startupPattern, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupPattern: null, loading: false, error: error.message });
    }
  }, []);

  const createStartupPattern = useCallback(async (createStartupPattern: StartupPatternCreate) => {
    try {
      const startupPattern = await supabaseCreateStartupPattern(createStartupPattern);
      setState({ startupPattern, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupPattern: null, loading: false, error: error.message });
    }
  }, []);

  const updateStartupPattern = useCallback(async (updateStartupPattern: StartupPatternUpdate) => {
    try {
      const startupPattern = await supabaseUpdateStartupPattern(updateStartupPattern);
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
