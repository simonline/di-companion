import { useState, useCallback } from 'react';
import { supabaseGetSurveys } from '@/lib/supabase';
import type { Survey } from '@/types/supabase';

interface UseSurveys {
  surveys: Survey[] | null;
  loading: boolean;
  error: string | null;
}

interface UseSurveysReturn extends UseSurveys {
  fetchSurveys: () => void;
  clearError: () => void;
}

export default function useSurveys(): UseSurveysReturn {
  const [state, setState] = useState<UseSurveys>({
    surveys: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchSurveys = useCallback(async () => {
    try {
      const surveys = await supabaseGetSurveys();
      setState({ surveys, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ surveys: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchSurveys,
    surveys: state.surveys,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
