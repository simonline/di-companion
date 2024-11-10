import { useState, useCallback } from 'react';
import {
  strapiGetStartupExercise,
  strapiFindStartupExercise,
  strapiCreateStartupExercise,
  strapiUpdateStartupExercise,
} from '@/lib/strapi';
import type { StartupExercise, CreateStartupExercise, UpdateStartupExercise } from '@/types/strapi';

interface UseStartupExercise {
  startupExercise: StartupExercise | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupExerciseReturn extends UseStartupExercise {
  fetchStartupExercise: (documentId: string) => void;
  findPatternExercise: (
    startupDocumentId: string,
    patternDocumentId: string,
    exerciseDocumentId: string,
  ) => void;
  createStartupExercise: (createStartupExercise: CreateStartupExercise) => void;
  updateStartupExercise: (updateStartupExercise: UpdateStartupExercise) => void;
  clearError: () => void;
}

export default function useStartupExercise(): UseStartupExerciseReturn {
  const [state, setState] = useState<UseStartupExercise>({
    startupExercise: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartupExercise = useCallback(async (documentId: string) => {
    try {
      const startupExercise = await strapiGetStartupExercise(documentId);
      setState({ startupExercise, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupExercise: null, loading: false, error: error.message });
    }
  }, []);

  const findPatternExercise = useCallback(
    async (startupDocumentId: string, patternDocumentId: string, exerciseDocumentId: string) => {
      try {
        const startupExercise = await strapiFindStartupExercise(
          startupDocumentId,
          patternDocumentId,
          exerciseDocumentId,
        );
        setState({ startupExercise, loading: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setState({ startupExercise: null, loading: false, error: error.message });
      }
    },
    [],
  );

  const createStartupExercise = useCallback(
    async (createStartupExercise: CreateStartupExercise) => {
      try {
        const startupExercise = await strapiCreateStartupExercise(createStartupExercise);
        setState({ startupExercise, loading: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setState({ startupExercise: null, loading: false, error: error.message });
      }
    },
    [],
  );

  const updateStartupExercise = useCallback(
    async (updateStartupExercise: UpdateStartupExercise) => {
      try {
        const startupExercise = await strapiUpdateStartupExercise(updateStartupExercise);
        setState({ startupExercise, loading: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setState({ startupExercise: null, loading: false, error: error.message });
      }
    },
    [],
  );

  return {
    fetchStartupExercise,
    findPatternExercise,
    createStartupExercise,
    updateStartupExercise,
    startupExercise: state.startupExercise,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
