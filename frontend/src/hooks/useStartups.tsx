import { useState, useCallback } from 'react';
import { strapiGetStartups } from '@/lib/strapi';
import type { Startup } from '@/types/strapi';

interface UseStartups {
  startups: Startup[] | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupsReturn extends UseStartups {
  fetchStartups: () => void;
  clearError: () => void;
}

export default function useStartups(): UseStartupsReturn {
  const [state, setState] = useState<UseStartups>({
    startups: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartups = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const startups = await strapiGetStartups();
      setState({ startups, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ startups: null, loading: false, error: error.message });
    }
  }, []);

  return {
    fetchStartups,
    startups: state.startups,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
