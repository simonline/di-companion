import { useState, useCallback } from 'react';
import {
  strapiGetStartupQuestion,
  strapiFindStartupQuestion,
  strapiCreateStartupQuestion,
  strapiUpdateStartupQuestion,
} from '@/lib/strapi';
import type { StartupQuestion, CreateStartupQuestion, UpdateStartupQuestion } from '@/types/strapi';

interface UseStartupQuestion {
  startupQuestion: StartupQuestion | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupQuestionReturn extends UseStartupQuestion {
  fetchStartupQuestion: (documentId: string) => void;
  findPatternExercise: (
    startupDocumentId: string,
    patternDocumentId: string,
    exerciseDocumentId: string,
  ) => void;
  createStartupQuestion: (createStartupQuestion: CreateStartupQuestion) => void;
  updateStartupQuestion: (updateStartupQuestion: UpdateStartupQuestion) => void;
  clearError: () => void;
}

export default function useStartupQuestion(): UseStartupQuestionReturn {
  const [state, setState] = useState<UseStartupQuestion>({
    startupQuestion: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartupQuestion = useCallback(async (documentId: string) => {
    try {
      const startupQuestion = await strapiGetStartupQuestion(documentId);
      setState({ startupQuestion, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupQuestion: null, loading: false, error: error.message });
    }
  }, []);

  const findPatternExercise = useCallback(
    async (startupDocumentId: string, patternDocumentId: string, exerciseDocumentId: string) => {
      try {
        const startupQuestion = await strapiFindStartupQuestion(
          startupDocumentId,
          patternDocumentId,
          exerciseDocumentId,
        );
        setState({ startupQuestion, loading: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setState({ startupQuestion: null, loading: false, error: error.message });
      }
    },
    [],
  );

  const createStartupQuestion = useCallback(
    async (createStartupQuestion: CreateStartupQuestion) => {
      try {
        const startupQuestion = await strapiCreateStartupQuestion(createStartupQuestion);
        setState({ startupQuestion, loading: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setState({ startupQuestion: null, loading: false, error: error.message });
      }
    },
    [],
  );

  const updateStartupQuestion = useCallback(
    async (updateStartupQuestion: UpdateStartupQuestion) => {
      try {
        const startupQuestion = await strapiUpdateStartupQuestion(updateStartupQuestion);
        setState({ startupQuestion, loading: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setState({ startupQuestion: null, loading: false, error: error.message });
      }
    },
    [],
  );

  return {
    fetchStartupQuestion,
    findPatternExercise,
    createStartupQuestion,
    updateStartupQuestion,
    startupQuestion: state.startupQuestion,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
