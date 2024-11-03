import { useState, useCallback } from 'react';
import { strapiGetStartupExercises } from '@/lib/strapi';
import type { StartupExercise } from '@/types/strapi';

interface UseStartupExercises {
  startupExercises: StartupExercise[] | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupExercisesReturn extends UseStartupExercises {
  fetchStartupExercises: () => void;
  clearError: () => void;
}

export default function useStartupExercises(): UseStartupExercisesReturn {
  const [state, setState] = useState<UseStartupExercises>({
    startupExercises: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartupExercises = useCallback(async () => {
    try {
      const startupExercises = await strapiGetStartupExercises();
      setState({ startupExercises, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupExercises: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchStartupExercises,
    startupExercises: state.startupExercises,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
