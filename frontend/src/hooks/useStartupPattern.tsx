import { useState, useCallback } from 'react';
import {
  supabaseGetStartupPattern,
  supabaseCreateStartupPattern,
  supabaseUpdateStartupPattern,
} from '@/lib/supabase';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database';

interface UseStartupPattern {
  startupPattern: Tables<'startup_patterns'> | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupPatternReturn extends UseStartupPattern {
  fetchStartupPattern: (id: string) => void;
  createStartupPattern: (createStartupPattern: TablesInsert<'startup_patterns'>) => void;
  updateStartupPattern: (updateStartupPattern: TablesUpdate<'startup_patterns'>) => void;
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

  const createStartupPattern = useCallback(async (createStartupPattern: TablesInsert<'startup_patterns'>) => {
    try {
      const startupPattern = await supabaseCreateStartupPattern(createStartupPattern);
      setState({ startupPattern, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupPattern: null, loading: false, error: error.message });
    }
  }, []);

  const updateStartupPattern = useCallback(async (updateStartupPattern: TablesUpdate<'startup_patterns'>) => {
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
