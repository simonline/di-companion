import { useCallback, useEffect, useState } from 'react';
import { strapiGetPatterns, strapiGetStartupPatterns } from '@/lib/strapi';
import type { Pattern, Startup, StartupPattern } from '@/types/strapi';
import { CategoryEnum } from '@/utils/constants';

interface UsePatterns {
  startup: Startup | null;
  recommendedPatterns: Pattern[] | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface UsePatternsReturn extends Omit<UsePatterns, 'initialized'> {
  getRecommendedPatterns: (count?: number) => Promise<void>;
  clearError: () => void;
}

export default function usePatterns(): UsePatternsReturn {
  const [state, setState] = useState<UsePatterns>({
    startup: null,
    recommendedPatterns: null,
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

  const getRandomItem = <T,>(array: T[]): T | null => {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  };

  const getRecommendedCategory = useCallback((startup: Startup, excludedCategories: CategoryEnum[] = []): CategoryEnum | null => {
    if (!startup?.scores) return CategoryEnum.entrepreneur;

    const scores = startup.scores;

    // Start with all scored categories that aren't excluded
    let categories = Object.keys(scores).filter(
      category => !excludedCategories.includes(category as CategoryEnum)
    ) as CategoryEnum[];

    // If startup.categories exists and is not empty, only consider categories from that list
    if (startup.categories && startup.categories.length > 0) {
      categories = categories.filter(category =>
        startup.categories!.includes(category)
      );
    }

    // If all categories are excluded, return null
    if (categories.length === 0) return null;

    // Find the lowest score among remaining categories
    const lowestScore = Math.min(...categories.map(category => scores[category]));

    const lowestCategories = categories.filter(
      category => scores[category] === lowestScore
    );

    return getRandomItem(lowestCategories);
  }, []);

  const getRecommendedPatterns = useCallback(
    async (count?: number) => {
      // Return early if not initialized
      if (!state.initialized) {
        console.warn('Attempting to get next pattern before initialization');
        return;
      }

      setState((prev) => ({ ...prev, loading: true }));
      try {
        // Fetch patterns already started/applied by startup
        let usedPatterns: StartupPattern[] = [];
        if (state.startup) {
          usedPatterns = await strapiGetStartupPatterns(state.startup.documentId);
        }

        // Get used pattern documentIds
        const usedPatternDocumentIds = usedPatterns.map((usedPattern) => usedPattern.pattern?.documentId);

        // Try to find patterns from categories starting with the lowest score
        const excludedCategories: CategoryEnum[] = [];
        let availablePatterns: Pattern[] = [];
        let filteredPatterns: Pattern[] = [];
        let category: CategoryEnum | null;

        // Keep trying categories until we find patterns or run out of categories
        while (filteredPatterns.length === 0) {
          category = getRecommendedCategory(state.startup as Startup, excludedCategories);

          // If all categories have been tried, break the loop
          if (category === null) break;

          // Fetch available patterns for that category
          availablePatterns = await strapiGetPatterns(category);

          // Remove patterns already started/applied by startup
          filteredPatterns = availablePatterns.filter(
            (pattern) => !usedPatternDocumentIds.includes(pattern.documentId)
          );

          // If no patterns available in this category, exclude it and try another
          if (filteredPatterns.length === 0) {
            excludedCategories.push(category);
          }
        }

        // Get random patterns from available patterns
        const randomPatterns: Pattern[] = [];
        // Loop over count to get multiple patterns (default 1), avoid duplicates
        for (let i = 0; i < (count || 1); i++) {
          const randomPattern = getRandomItem(filteredPatterns);
          if (randomPattern) {
            randomPatterns.push(randomPattern);
            filteredPatterns.splice(filteredPatterns.indexOf(randomPattern), 1);
          }
        }

        setState((prev) => ({
          ...prev,
          recommendedPatterns: randomPatterns,
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
    },
    [state.initialized, state.startup, getRecommendedCategory],
  );

  return {
    ...state,
    getRecommendedPatterns,
    clearError,
  };
}
