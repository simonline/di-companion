import { useState, useCallback } from 'react';
import {
  supabaseGetRequests,
  supabaseCreateRequest,
  supabaseUpdateRequest,
  supabaseDeleteRequest,
} from '@/lib/supabase';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database';

interface UseRequests {
  requests: Tables<'requests'>[] | null;
  loading: boolean;
  error: string | null;
}

interface UseRequestsReturn extends UseRequests {
  fetchRequests: (startupId: string) => void;
  createRequest: (data: TablesInsert<'requests'>) => Promise<Tables<'requests'>>;
  updateRequest: (data: TablesUpdate<'requests'>) => Promise<Tables<'requests'>>;
  deleteRequest: (id: string) => Promise<void>;
  clearError: () => void;
}

export default function useRequests(): UseRequestsReturn {
  const [state, setState] = useState<UseRequests>({
    requests: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchRequests = useCallback(async (startupId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const requests = await supabaseGetRequests(startupId);
      setState({ requests, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ requests: null, loading: false, error: error.message });
    }
  }, []);

  const createRequest = useCallback(async (data: TablesInsert<'requests'>) => {
    try {
      const newRequest = await supabaseCreateRequest(data);
      setState((prev) => ({
        ...prev,
        requests: prev.requests ? [...prev.requests, newRequest] : [newRequest],
      }));
      return newRequest;
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  const updateRequest = useCallback(async (data: TablesUpdate<'requests'>) => {
    try {
      const updatedRequest = await supabaseUpdateRequest(data);
      setState((prev) => ({
        ...prev,
        requests:
          prev.requests?.map((item) =>
            item.id === data.id ? updatedRequest : item,
          ) || null,
      }));
      return updatedRequest;
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    try {
      await supabaseDeleteRequest(id);
      setState((prev) => ({
        ...prev,
        requests: prev.requests?.filter((item) => item.id !== id) || null,
      }));
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  return {
    fetchRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    requests: state.requests,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
