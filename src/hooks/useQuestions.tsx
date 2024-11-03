import { useState, useCallback } from 'react';
import { strapiGetQuestions } from '@/lib/strapi';
import type { Question } from '@/types/strapi';

interface UseQuestions {
  questions: Question[] | null;
  loading: boolean;
  error: string | null;
}

interface UseQuestionsReturn extends UseQuestions {
  fetchQuestions: () => void;
  clearError: () => void;
}

export default function useQuestions(): UseQuestionsReturn {
  const [state, setState] = useState<UseQuestions>({
    questions: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      const questions = await strapiGetQuestions();
      setState({ questions, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ questions: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchQuestions,
    questions: state.questions,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
