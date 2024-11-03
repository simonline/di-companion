import { useState, useCallback } from 'react';
import { strapiGetStartupQuestions } from '@/lib/strapi';
import type { StartupQuestion } from '@/types/strapi';

interface UseStartupQuestions {
  startupQuestions: StartupQuestion[] | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupQuestionsReturn extends UseStartupQuestions {
  fetchStartupQuestions: () => void;
  clearError: () => void;
}

export default function useStartupQuestions(): UseStartupQuestionsReturn {
  const [state, setState] = useState<UseStartupQuestions>({
    startupQuestions: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartupQuestions = useCallback(async () => {
    try {
      const startupQuestions = await strapiGetStartupQuestions();
      setState({ startupQuestions, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupQuestions: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchStartupQuestions,
    startupQuestions: state.startupQuestions,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
