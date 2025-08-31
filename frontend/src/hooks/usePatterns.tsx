import { useState, useCallback } from 'react';
import { supabaseGetPatterns } from '@/lib/supabase';
import { Tables } from '@/types/database';

interface UsePatterns {
  patterns: Tables<'patterns'>[] | null;
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
      const patterns = await supabaseGetPatterns();
      setState({ patterns, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
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
