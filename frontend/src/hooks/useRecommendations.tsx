import { useState, useCallback } from 'react';
import {
  supabaseGetRecommendations,
  supabaseCreateRecommendation,
  supabaseUpdateRecommendation,
  supabaseDeleteRecommendation,
} from '@/lib/supabase';
import type {
  Recommendation,
  RecommendationCreate,
  RecommendationUpdate
} from '@/types/database';

interface UseRecommendations {
  recommendations: Recommendation[] | null;
  loading: boolean;
  error: string | null;
}

interface UseRecommendationsReturn extends UseRecommendations {
  fetchRecommendations: (startupId?: string) => void;
  createRecommendation: (data: RecommendationCreate, patternIds?: string[]) => Promise<Recommendation>;
  updateRecommendation: (data: RecommendationUpdate, patternIds?: string[]) => Promise<Recommendation>;
  deleteRecommendation: (id: string) => Promise<void>;
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

  const fetchRecommendations = useCallback(async (startupId?: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const recommendations = await supabaseGetRecommendations(startupId);
      setState({ recommendations, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ recommendations: null, loading: false, error: error.message });
    }
  }, []);

  const createRecommendation = useCallback(async (data: RecommendationCreate, patternIds?: string[]) => {
    try {
      const newRecommendation = await supabaseCreateRecommendation(data, patternIds);
      setState((prev) => ({
        ...prev,
        recommendations: prev.recommendations
          ? [...prev.recommendations, newRecommendation]
          : [newRecommendation],
      }));
      return newRecommendation;
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  const updateRecommendation = useCallback(async (data: RecommendationUpdate, patternIds?: string[]) => {
    try {
      const updatedRecommendation = await supabaseUpdateRecommendation(data, patternIds);
      setState((prev) => ({
        ...prev,
        recommendations:
          prev.recommendations?.map((item) =>
            item.id === data.id ? updatedRecommendation : item,
          ) || null,
      }));
      return updatedRecommendation;
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  const deleteRecommendation = useCallback(async (id: string) => {
    try {
      await supabaseDeleteRecommendation(id);
      setState((prev) => ({
        ...prev,
        recommendations:
          prev.recommendations?.filter((item) => item.id !== id) || null,
      }));
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  return {
    fetchRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
    recommendations: state.recommendations,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
