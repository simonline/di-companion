import { useState, useCallback } from 'react';
import {
  supabaseGetRecommendations,
  supabaseCreateRecommendation,
  supabaseUpdateRecommendation,
  supabaseDeleteRecommendation,
} from '@/lib/supabase';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database';

interface UseRecommendations {
  recommendations: Tables<'recommendations'>[] | null;
  loading: boolean;
  error: string | null;
}

interface UseRecommendationsReturn extends UseRecommendations {
  fetchRecommendations: (startupId?: string) => void;
  createRecommendation: (data: TablesInsert<'recommendations'>) => Promise<Tables<'recommendations'>>;
  updateRecommendation: (data: TablesUpdate<'recommendations'>) => Promise<Tables<'recommendations'>>;
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

  const createRecommendation = useCallback(async (data: TablesInsert<'recommendations'>) => {
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

  const updateRecommendation = useCallback(async (data: TablesUpdate<'recommendations'>) => {
    try {
      const updatedRecommendation = await supabaseUpdateRecommendation(data);
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
