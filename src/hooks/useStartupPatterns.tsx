import { useState, useCallback } from 'react';
import { strapiGetStartupPatterns } from '@/lib/strapi';
import type { StartupPattern } from '@/types/strapi';

interface UseStartupPatterns {
  startupPatterns: StartupPattern[] | null;
  loading: boolean;
  error: string | null;
}

interface UseStartupPatternsReturn extends UseStartupPatterns {
  fetchStartupPatterns: (startupDocumentId: string, patternDocumentId?: string) => void;
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
    async (startupDocumentId: string, patternDocumentId?: string) => {
      try {
        const startupPatterns = await strapiGetStartupPatterns(
          startupDocumentId,
          patternDocumentId,
        );

        // Get only latest (createdAt) patterns for each combination of startup/pattern (documentId)
        // FIXME: Create /latest endpoint for this (in progress)
        const latestPatterns = startupPatterns
          ? Object.values(
              startupPatterns.reduce(
                (acc, pattern) => {
                  const key = `${pattern.startup.documentId}-${pattern.pattern.documentId}`;
                  if (!acc[key] || acc[key].createdAt > pattern.createdAt) {
                    acc[key] = pattern;
                  }
                  return acc;
                },
                {} as Record<string, StartupPattern>,
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
