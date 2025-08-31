import { useState, useCallback } from 'react';
import { supabaseGetStartupPatterns } from '@/lib/supabase';
import { Tables } from '@/types/database';

interface UseStartupPatterns {
  startupPatterns: Tables<'startup_patterns'>[] | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupPatternsReturn extends UseStartupPatterns {
  fetchStartupPatterns: (startupId: string, patternId?: string) => void;
  clearError: () => void;
}

export default function useStartupPatterns(): UseStartupPatternsReturn {
  const [state, setState] = useState<UseStartupPatterns>({
    startupPatterns: null,
    loading: true,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchStartupPatterns = useCallback(
    async (startupId: string, patternId?: string) => {
      try {
        const startupPatterns = await supabaseGetStartupPatterns(
          startupId,
          patternId,
        );

        // Get only latest (created_at) patterns for each combination of startup/pattern (id)
        // FIXME: Create /latest endpoint for this (in progress)
        const latestPatterns = startupPatterns
          ? Object.values(
            startupPatterns.reduce(
              (acc, pattern) => {
                // Ignore if no pattern given
                if (!pattern.pattern) return acc;
                const key = `${pattern.startup.id}-${pattern.pattern?.id}`;
                if (!acc[key] || acc[key].created_at > pattern.created_at) {
                  acc[key] = pattern;
                }
                return acc;
              },
              {} as Record<string, Tables<'startup_patterns'>>,
            ),
          )
          : [];
        setState({ startupPatterns: latestPatterns, loading: false, error: null });
      } catch (err: unknown) {
        const error = err as Error;
        setState({ startupPatterns: null, loading: false, error: error.message });
      }
    },
    [],
  );

  return {
    fetchStartupPatterns,
    startupPatterns: state.startupPatterns,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}
