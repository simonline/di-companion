import { useState, useCallback } from 'react';
import { supabaseGetPattern, supabaseGetSurvey, supabaseGetSurveyByName } from '@/lib/supabase';
import { Tables } from '@/types/database';

interface UseSurvey {
  survey: Tables<'surveys'> | null;
  loading: boolean;
  error: string | null;
}

interface UseSurveyReturn extends UseSurvey {
  fetchSurvey: (id: string) => void;
  fetchSurveyByPattern: (pattern_id: string) => void;
  fetchSurveyByName: (name: string) => void;
  clearError: () => void;
}

export default function useSurvey(): UseSurveyReturn {
  const [state, setState] = useState<UseSurvey>({
    survey: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchSurvey = useCallback(async (id: string) => {
    try {
      const survey = await supabaseGetSurvey(id);
      setState({ survey, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ survey: null, loading: false, error: error.message });
    }
  }, []);

  const fetchSurveyByPattern = useCallback(async (pattern_id: string) => {
    try {
      const pattern = await supabaseGetPattern(patternId);
      if (!pattern.survey) {
        throw new Error('Pattern does not have a survey');
      }
      const survey = await supabaseGetSurvey(pattern.survey.id);
      setState({ survey, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ survey: null, loading: false, error: error.message });
    }
  }, []);

  const fetchSurveyByName = useCallback(async (name: string) => {
    try {
      const survey = await supabaseGetSurveyByName(name);
      setState({ survey, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ survey: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchSurvey,
    fetchSurveyByPattern,
    fetchSurveyByName,
    survey: state.survey,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
