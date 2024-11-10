import { useState, useCallback } from 'react';
import { strapiGetPattern, strapiGetExercise } from '@/lib/strapi';
import type { Exercise } from '@/types/strapi';

interface UseExercise {
  exercise: Exercise | null;
  loading: boolean;
  error: string | null;
}

interface UseExerciseReturn extends UseExercise {
  fetchExercise: (documentId: string) => void;
  fetchExerciseByPattern: (patternId: string) => void;
  clearError: () => void;
}

export default function useExercise(): UseExerciseReturn {
  const [state, setState] = useState<UseExercise>({
    exercise: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchExercise = useCallback(async (documentId: string) => {
    try {
      const exercise = await strapiGetExercise(documentId);
      setState({ exercise, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ exercise: null, loading: false, error: error.message });
    }
  }, []);

  const fetchExerciseByPattern = useCallback(async (patternId: string) => {
    try {
      const pattern = await strapiGetPattern(patternId);
      if (!pattern.exercise) {
        throw new Error('Pattern does not have an exercise');
      }
      const exercise = await strapiGetExercise(pattern.exercise.documentId);
      setState({ exercise, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ exercise: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchExercise,
    fetchExerciseByPattern,
    exercise: state.exercise,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
