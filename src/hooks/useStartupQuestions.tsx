import { useState, useCallback } from 'react';
import { strapiGetStartupQuestions } from '@/lib/strapi';
import type { StartupQuestion } from '@/types/strapi';

interface UseStartupQuestions {
  startupQuestions: StartupQuestion[] | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupQuestionsReturn extends UseStartupQuestions {
  fetchStartupQuestions: (
    startupDocumentId?: string,
    patternDocumentId?: string,
    surveyDocumentId?: string,
  ) => void;
  clearError: () => void;
  clearStartupQuestions: () => void;
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

  const clearStartupQuestions = useCallback(() => {
    setState((prev) => ({ ...prev, startupQuestions: null }));
  }, []);

  const fetchStartupQuestions = useCallback(
    async (startupDocumentId?: string, patternDocumentId?: string, surveyDocumentId?: string) => {
      try {
        const startupQuestions = await strapiGetStartupQuestions(
          startupDocumentId,
          patternDocumentId,
          surveyDocumentId,
        );
        setState({ startupQuestions, loading: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setState({ startupQuestions: null, loading: false, error: error.message });
      }
    },
    [],
  );

  return {
    fetchStartupQuestions,
    startupQuestions: state.startupQuestions,
    loading: state.loading,
    error: state.error,
    clearError,
    clearStartupQuestions,
  };
}
