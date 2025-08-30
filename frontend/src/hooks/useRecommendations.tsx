import { useState, useCallback } from 'react';
import {
  supabaseGetRecommendations,
  supabaseCreateRecommendation,
  supabaseUpdateRecommendation,
  supabaseDeleteRecommendation,
  CreateRecommendation,
  UpdateRecommendation,
} from '@/lib/supabase';
import type { Recommendation } from '@/types/supabase';

interface UseRecommendations {
  recommendations: Recommendation[] | null;
  loading: boolean;
  error: string | null;
}

interface UseRecommendationsReturn extends UseRecommendations {
  fetchRecommendations: (startupId?: string) => void;
  createRecommendation: (data: CreateRecommendation) => Promise<Recommendation>;
  updateRecommendation: (data: UpdateRecommendation) => Promise<Recommendation>;
  deleteRecommendation: (documentId: string) => Promise<void>;
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

  const createRecommendation = useCallback(async (data: CreateRecommendation) => {
    try {
      const newRecommendation = await supabaseCreateRecommendation(data);
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

  const updateRecommendation = useCallback(async (data: UpdateRecommendation) => {
    try {
      const updatedRecommendation = await supabaseUpdateRecommendation(data);
      setState((prev) => ({
        ...prev,
        recommendations:
          prev.recommendations?.map((item) =>
            item.documentId === data.documentId ? updatedRecommendation : item,
          ) || null,
      }));
      return updatedRecommendation;
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  const deleteRecommendation = useCallback(async (documentId: string) => {
    try {
      await supabaseDeleteRecommendation(documentId);
      setState((prev) => ({
        ...prev,
        recommendations:
          prev.recommendations?.filter((item) => item.documentId !== documentId) || null,
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
