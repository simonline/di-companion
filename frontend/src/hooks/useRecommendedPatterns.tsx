import { useCallback, useEffect, useState } from 'react';
import { supabaseGetPatterns, supabaseGetStartupPatterns } from '@/lib/supabase';
import { Tables } from '@/types/database';
import { CategoryEnum } from '@/utils/constants';

interface UsePatterns {
  startup: Tables<'startups'> | null;
  recommendedPatterns: Tables<'patterns'>[] | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface UsePatternsReturn extends Omit<UsePatterns, 'initialized'> {
  getRecommendedPatterns: (count?: number) => Promise<void>;
  clearError: () => void;
}

type CategoryFilter = CategoryEnum | 'exclude-entrepreneur';

function isExcludeEntrepreneur(filter: CategoryFilter | undefined): filter is 'exclude-entrepreneur' {
  return filter === 'exclude-entrepreneur';
}

function isCategoryEnum(filter: CategoryFilter | undefined): filter is CategoryEnum {
  return filter !== undefined && filter !== 'exclude-entrepreneur';
}

export default function usePatterns(categoryFilter?: CategoryFilter): UsePatternsReturn {
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

  const getRecommendedCategory = useCallback((startup: Tables<'startups'>, excludedCategories: CategoryEnum[] = []): CategoryEnum | null => {
    if (!startup?.scores) {
      // If filtering for non-entrepreneur, return a random non-entrepreneur category
      if (isExcludeEntrepreneur(categoryFilter)) {
        const nonEntrepreneurCategories = Object.values(CategoryEnum).filter(c => c !== CategoryEnum.entrepreneur);
        return getRandomItem(nonEntrepreneurCategories);
      }
      // If filtering for specific category, return it
      if (isCategoryEnum(categoryFilter)) {
        return categoryFilter;
      }
      return CategoryEnum.entrepreneur;
    }

    const scores = startup.scores;

    // Start with all scored categories that aren't excluded
    let categories = Object.keys(scores).filter(
      category => !excludedCategories.includes(category as CategoryEnum)
    ) as CategoryEnum[];

    // Apply category filter
    if (isExcludeEntrepreneur(categoryFilter)) {
      categories = categories.filter(category => category !== CategoryEnum.entrepreneur);
    } else if (isCategoryEnum(categoryFilter)) {
      categories = categories.filter(category => category === categoryFilter);
    }

    // If startup.categories exists and is not empty, only consider categories from that list
    if (startup.categories && Array.isArray(startup.categories) && startup.categories.length > 0) {
      categories = categories.filter(category =>
        (startup.categories as string[]).includes(category)
      );
    }

    // If all categories are excluded, return null
    if (categories.length === 0) return null;

    // Find the lowest score among remaining categories
    const lowestScore = Math.min(...categories.map(category => (scores as any)[category]));

    const lowestCategories = categories.filter(
      category => (scores as any)[category] == null || (scores as any)[category] === lowestScore
    );

    return getRandomItem(lowestCategories);
  }, [categoryFilter]);

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
        let usedPatterns: Tables<'startup_patterns'>[] = [];
        if (state.startup) {
          usedPatterns = await supabaseGetStartupPatterns(state.startup.id);
        }

        // Get used pattern ids
        const usedpatternIds = usedPatterns.map((usedPattern) => usedPattern.pattern?.id);

        // Try to find patterns from categories starting with the lowest score
        const excludedCategories: CategoryEnum[] = [];
        let availablePatterns: Tables<'patterns'>[] = [];
        let filteredPatterns: Tables<'patterns'>[] = [];
        let category: CategoryEnum | null;

        console.log('usedpatternIds', usedpatternIds);
        console.log('state.startup', state.startup);
        console.log('excludedCategories', excludedCategories);
        console.log('availablePatterns', availablePatterns);
        console.log('filteredPatterns', filteredPatterns);

        // Keep trying categories until we find patterns or run out of categories
        while (filteredPatterns.length === 0) {
          category = getRecommendedCategory(state.startup as Startup, excludedCategories);

          // If all categories have been tried, break the loop
          if (category === null) break;

          // Fetch available patterns for that category
          console.log('category', category);
          // Fetch patterns based on category filter
          availablePatterns = await supabaseGetPatterns(category);

          // Remove patterns already started/applied by startup
          filteredPatterns = availablePatterns.filter(
            (pattern) => !usedpatternIds.includes(pattern.id)
          );

          // If no patterns available in this category, exclude it and try another
          if (filteredPatterns.length === 0) {
            excludedCategories.push(category);
          }
        }

        // Get random patterns from available patterns
        const randomPatterns: Tables<'patterns'>[] = [];
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
