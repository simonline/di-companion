import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  strapiGetStartupPatterns,
  strapiGetPatterns,
  strapiMe,
  strapiLogin,
  strapiLogout,
  strapiRegister,
  strapiCreateStartup,
  strapiUpdateStartup,
} from '@/lib/strapi';
import type {
  CreateStartup,
  Startup,
  User,
  UserRegistration,
  StartupPattern,
  Pattern,
  UpdateStartup,
} from '@/types/strapi';
import type { CategoryEnum } from '@/utils/constants';

interface AuthState {
  user: User | null;
  startup: Startup | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (identifier: string, password: string) => Promise<User>;
  register: (data: UserRegistration) => Promise<User>;
  createStartup: (data: CreateStartup) => Promise<Startup>;
  updateStartup: (data: UpdateStartup) => Promise<Startup>;
  updateScores: () => Promise<Record<CategoryEnum, number> | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    startup: null,
    loading: true,
    error: null,
  });

  // Initialize user/startup from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedStartup = localStorage.getItem('startup');
      setState((prev) => ({
        ...prev,
        user: storedUser ? JSON.parse(storedUser) : null,
        startup: storedStartup ? JSON.parse(storedStartup) : null,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to restore authentication state',
      }));
    }
  }, []);

  const setUser = useCallback((userData: User | null) => {
    setState((prev) => ({ ...prev, user: userData, error: null }));
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const setStartup = useCallback((startupData: Startup | null) => {
    setState((prev) => ({ ...prev, startup: startupData, error: null }));
    if (startupData) {
      localStorage.setItem('startup', JSON.stringify(startupData));
    } else {
      localStorage.removeItem('startup');
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(
    async (identifier: string, password: string): Promise<User> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await strapiLogin(identifier, password);
        const userData = await strapiMe();
        setUser(userData);
        userData.startups?.length > 0 && setStartup(userData.startups[0]);
        return userData;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error: err.message,
          loading: false,
        }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [setUser, setStartup],
  );

  const register = useCallback(
    async (data: UserRegistration): Promise<User> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await strapiRegister(data);
        const userData: User = result.user;
        setUser(userData);
        return userData;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error: err.message,
          loading: false,
        }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [setUser],
  );

  const createStartup = useCallback(
    async (data: CreateStartup): Promise<Startup> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const startup = await strapiCreateStartup(data);
        setStartup(startup);
        return startup;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error: err.message,
          loading: false,
        }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [setStartup],
  );

  const updateStartup = useCallback(
    async (data: UpdateStartup): Promise<Startup> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const startup = await strapiUpdateStartup(data);
        setStartup(startup);
        return startup;
      } catch (error) {
        const err = error as Error;
        setState((prev) => ({
          ...prev,
          error: err.message,
          loading: false,
        }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [setStartup],
  );

  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await strapiLogout();
      setUser(null);
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error: err.message,
        loading: false,
      }));
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [setUser]);

  const updateScores = useCallback(async (): Promise<Record<CategoryEnum, number> | null> => {
    if (!state.startup) return null;

    let startupPatterns: StartupPattern[] = [];
    let patterns: Pattern[] = [];
    try {
      startupPatterns = await strapiGetStartupPatterns(state.startup.documentId);
      patterns = await strapiGetPatterns();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch next pattern',
      }));
    }

    const categoryPoints: Record<CategoryEnum, number[]> = {
      entrepreneur: [0, 0],
      team: [0, 0],
      stakeholders: [0, 0],
      product: [0, 0],
      sustainability: [0, 0],
    };

    // Get total points achieved for each category
    startupPatterns.forEach((startupPattern) => {
      if (!startupPattern.pattern.category) return;
      console.log(startupPattern.pattern.category);
      categoryPoints[startupPattern.pattern.category][0] += startupPattern.points;
    });
    console.log(categoryPoints);

    // Get total points available for each category
    patterns.forEach((pattern) => {
      if (!pattern.category) return;
      categoryPoints[pattern.category][1] += 5;
    });

    // Calculate the maturity score for each category
    const categoryScores = Object.entries(categoryPoints).map(
      ([category, [pointsAchieved, totalPoints]]) => [
        category as CategoryEnum,
        // Round score to 2 decimal places
        Math.round((pointsAchieved / totalPoints) * 100) / 100,
      ],
    );
    const maturityScores = Object.fromEntries(categoryScores);
    console.log(maturityScores);

    // Update the startup with the new scores
    updateStartup({
      documentId: state.startup.documentId,
      scores: maturityScores,
    });

    return maturityScores;
  }, [state.startup, updateStartup]);

  return {
    user: state.user,
    startup: state.startup,
    loading: state.loading,
    error: state.error,
    login,
    register,
    createStartup,
    updateStartup,
    updateScores,
    logout,
    isAuthenticated: Boolean(state.user),
    clearError,
  };
}

const AuthContext = createContext<UseAuthReturn | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
