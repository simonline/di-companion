import { useState, useCallback } from 'react';
import { strapiGetRecommendations } from '@/lib/strapi';
import type { Recommendation } from '@/types/strapi';

interface UseRecommendations {
  recommendations: Recommendation[] | null;
  loading: boolean;
  error: string | null;
}

interface UseRecommendationsReturn extends UseRecommendations {
  fetchRecommendations: () => void;
  clearError: () => void;
}

export default function useRecommendations(): UseRecommendationsReturn {
  const [state, setState] = useState<UseRecommendations>({
    recommendations: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      const recommendations = await strapiGetRecommendations();
      setState({ recommendations, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ recommendations: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchRecommendations,
    recommendations: state.recommendations,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
