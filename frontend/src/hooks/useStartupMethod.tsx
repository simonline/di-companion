import { useState, useCallback } from 'react';
import {
  supabaseFindStartupMethod,
  supabaseCreateStartupMethod,
  supabaseUpdateStartupMethod,
} from '@/lib/supabase';
import type { StartupMethod, CreateStartupMethod, UpdateStartupMethod } from '@/types/supabase';

interface UseStartupMethod {
  startupMethod: StartupMethod | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupMethodReturn extends UseStartupMethod {
  findPatternMethod: (startupId: string, patternId: string, methodId: string) => void;
  createStartupMethod: (data: CreateStartupMethod) => void;
  updateStartupMethod: (data: UpdateStartupMethod) => void;
  clearError: () => void;
}

export default function useStartupMethod(): UseStartupMethodReturn {
  const [state, setState] = useState<UseStartupMethod>({
    startupMethod: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const findPatternMethod = useCallback(async (startupId: string, patternId: string, methodId: string) => {
    try {
      const startupMethod = await supabaseFindStartupMethod(startupId, patternId, methodId);
      setState({ startupMethod, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupMethod: null, loading: false, error: error.message });
    }
  }, []);

  const createStartupMethod = useCallback(async (data: CreateStartupMethod) => {
    try {
      const startupMethod = await supabaseCreateStartupMethod(data);
      setState({ startupMethod, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  const updateStartupMethod = useCallback(async (data: UpdateStartupMethod) => {
    try {
      const startupMethod = await supabaseUpdateStartupMethod(data);
      setState({ startupMethod, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  return {
    findPatternMethod,
    createStartupMethod,
    updateStartupMethod,
    startupMethod: state.startupMethod,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
