import { useMemo } from 'react';
import { create } from 'zustand';
import { Themes } from '@/theme/types';
import type { Actions } from './types';

const useThemeStore = create<{
  themeMode: Themes;
  setThemeMode: (theme: Themes) => void;
  toggleTheme: () => void;
}>((set) => ({
  themeMode: (localStorage.getItem('theme-mode') as Themes) || Themes.LIGHT,

  setThemeMode: (theme) => {
    localStorage.setItem('theme-mode', theme);
    set({ themeMode: theme });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.themeMode === Themes.DARK ? Themes.LIGHT : Themes.DARK;
      localStorage.setItem('theme-mode', newTheme);
      return { themeMode: newTheme };
    });
  },
}));

function useTheme(): [Themes, Actions] {
  const themeMode = useThemeStore((state) => state.themeMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const memoizedActions = useMemo(() => ({ toggle: toggleTheme }), [toggleTheme]);

  return [themeMode, memoizedActions];
}

export default useTheme;
