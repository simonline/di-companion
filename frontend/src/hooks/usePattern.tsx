import { useState, useCallback } from 'react';
import { supabaseGetPattern } from '@/lib/supabase';
import type { Pattern } from '@/types/supabase';

interface UsePattern {
  pattern: Pattern | null;
  loading: boolean;
  error: string | null;
}

interface UsePatternReturn extends UsePattern {
  fetchPattern: (documentId: string) => void;
  clearError: () => void;
}

export default function usePattern(): UsePatternReturn {
  const [state, setState] = useState<UsePattern>({
    pattern: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchPattern = useCallback(async (documentId: string) => {
    try {
      const pattern = await supabaseGetPattern(documentId);
      setState({ pattern, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ pattern: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchPattern,
    pattern: state.pattern,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
