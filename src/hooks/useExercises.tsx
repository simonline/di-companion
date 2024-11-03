import { useState, useCallback } from 'react';
import { strapiGetExercises } from '@/lib/strapi';
import type { Exercise } from '@/types/strapi';

interface UseExercises {
  exercises: Exercise[] | null;
  loading: boolean;
  error: string | null;
}

interface UseExercisesReturn extends UseExercises {
  fetchExercises: () => void;
  clearError: () => void;
}

export default function useExercises(): UseExercisesReturn {
  const [state, setState] = useState<UseExercises>({
    exercises: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchExercises = useCallback(async () => {
    try {
      const exercises = await strapiGetExercises();
      setState({ exercises, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ exercises: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchExercises,
    exercises: state.exercises,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
