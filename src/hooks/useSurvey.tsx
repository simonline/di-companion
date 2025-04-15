import { useState, useCallback } from 'react';
import { strapiGetPattern, strapiGetSurvey, strapiGetSurveyByName } from '@/lib/strapi';
import type { Survey } from '@/types/strapi';

interface UseSurvey {
  survey: Survey | null;
  loading: boolean;
  error: string | null;
}

interface UseSurveyReturn extends UseSurvey {
  fetchSurvey: (documentId: string) => void;
  fetchSurveyByPattern: (patternId: string) => void;
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

  const fetchSurvey = useCallback(async (documentId: string) => {
    try {
      const survey = await strapiGetSurvey(documentId);
      setState({ survey, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ survey: null, loading: false, error: error.message });
    }
  }, []);

  const fetchSurveyByPattern = useCallback(async (patternId: string) => {
    try {
      const pattern = await strapiGetPattern(patternId);
      if (!pattern.survey) {
        throw new Error('Pattern does not have a survey');
      }
      const survey = await strapiGetSurvey(pattern.survey.documentId);
      setState({ survey, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ survey: null, loading: false, error: error.message });
    }
  }, []);

  const fetchSurveyByName = useCallback(async (name: string) => {
    try {
      const survey = await strapiGetSurveyByName(name);
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
