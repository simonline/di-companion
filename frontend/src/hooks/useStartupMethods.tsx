import { useState, useCallback } from 'react';
import { supabaseGetStartupMethods } from '@/lib/supabase';
import { StartupMethod } from '@/types/database';

interface UseStartupMethods {
  startupMethods: StartupMethod[] | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupMethodsReturn extends UseStartupMethods {
  fetchStartupMethods: () => void;
  clearError: () => void;
}

export default function useStartupMethods(): UseStartupMethodsReturn {
  const [state, setState] = useState<UseStartupMethods>({
    startupMethods: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartupMethods = useCallback(async () => {
    try {
      const startupMethods = await supabaseGetStartupMethods();
      setState({ startupMethods, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startupMethods: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchStartupMethods,
    startupMethods: state.startupMethods,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
