import { useCallback, useEffect, useState } from 'react';
import { strapiGetPatterns, strapiGetStartupPatterns } from '@/lib/strapi';
import type { Pattern, Startup, StartupPattern } from '@/types/strapi';
import { CategoryEnum } from '@/utils/constants';

interface UsePatterns {
  startup: Startup | null;
  pattern: Pattern | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface UsePatternsReturn extends Omit<UsePatterns, 'initialized'> {
  getNextPattern: () => Promise<void>;
  clearError: () => void;
}

export default function usePatterns(): UsePatternsReturn {
  const [state, setState] = useState<UsePatterns>({
    startup: null,
    pattern: null,
    loading: true,
    error: null,
    initialized: false,
  });

  // Initialize startup from localStorage
  useEffect(() => {
    try {
      const storedStartup = localStorage.getItem('startup');
      setState((prev) => ({
        ...prev,
        startup: storedStartup ? JSON.parse(storedStartup) : null,
        initialized: true, // Mark as initialized after localStorage is read
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to restore pattern state',
        initialized: true, // Still mark as initialized even if there's an error
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const getNextCategory = useCallback((startup: Startup): CategoryEnum => {
    if (!startup?.scores) return CategoryEnum.entrepreneur;
    const scores = startup.scores;
    const lowestScore = Math.min(...Object.values(scores));
    return Object.keys(startup.scores).filter(
      (category) => scores[category as CategoryEnum] === lowestScore,
    )[0] as CategoryEnum;
  }, []);

  const getRandomItem = <T,>(array: T[]): T | null => {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  };

  const getNextPattern = useCallback(async () => {
    // Return early if not initialized
    if (!state.initialized) {
      console.warn('Attempting to get next pattern before initialization');
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Get category with lowest score
      const category = getNextCategory(state.startup as Startup);

      // Fetch available patterns for that category
      const availablePatterns = await strapiGetPatterns(category);

      // Fetch patterns already started/completed by startup
      let usedPatterns: StartupPattern[] = [];
      if (state.startup) {
        usedPatterns = await strapiGetStartupPatterns(state.startup.documentId);
      }

      // Remove patterns already started/completed by startup
      const filteredPatterns = availablePatterns.filter(
        (pattern) =>
          !usedPatterns.some(
            (usedPattern) => usedPattern.pattern.documentId === pattern.documentId,
          ),
      );

      // Get a random pattern from available patterns
      const randomPattern = getRandomItem(filteredPatterns);

      setState((prev) => ({
        ...prev,
        pattern: randomPattern,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch next pattern',
      }));
    }
  }, [state.initialized, state.startup, getNextCategory]);

  return {
    ...state,
    getNextPattern,
    clearError,
  };
}
