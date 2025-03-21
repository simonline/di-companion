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
  strapiUpdateUser,
} from '@/lib/strapi';
import type {
  CreateStartup,
  Startup,
  User,
  UserRegistration,
  StartupPattern,
  Pattern,
  UpdateStartup,
  UpdateUser,
} from '@/types/strapi';
import type { CategoryEnum } from '@/utils/constants';
import { authEvents, isTokenExpired } from '@/lib/axios';

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
  updateUser: (data: UpdateUser) => Promise<User>;
  updateScores: () => Promise<Record<CategoryEnum, number> | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
  checkTokenExpiration: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    startup: null,
    loading: true,
    error: null,
  });

  // Function to check if the JWT token is expired - using the exported function
  const checkTokenExpiration = useCallback((): boolean => {
    return isTokenExpired();
  }, []);

  // Setup event listener for logout events
  useEffect(() => {
    // Listen for logout events
    const handleLogout = () => {
      logout().catch(console.error);
    };

    authEvents.on('logout', handleLogout);

    // Periodically check token expiration (every minute)
    const tokenCheckInterval = setInterval(() => {
      if (checkTokenExpiration() && state.user) {
        console.log('Token expired, logging out...');
        authEvents.dispatch('logout');
      }
    }, 60000);

    return () => {
      // Clean up
      authEvents.remove('logout', handleLogout);
      clearInterval(tokenCheckInterval);
    };
  });

  // Initialize user/startup from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedStartup = localStorage.getItem('startup');

      // Check if token is expired on initial load
      if (storedUser && checkTokenExpiration()) {
        console.log('Token expired on initial load, clearing auth state');
        localStorage.removeItem('user');
        localStorage.removeItem('startup');
        localStorage.removeItem('strapi_jwt');
        setState((prev) => ({
          ...prev,
          user: null,
          startup: null,
          loading: false,
        }));
        return;
      }

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
  }, [checkTokenExpiration]);

  const setUser = useCallback((userData: User | null) => {
    setState((prev) => ({ ...prev, user: userData, error: null }));
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('strapi_jwt'); // Also remove JWT when clearing user
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
        // JWT token is stored by strapiLogin function
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
        // JWT token is stored by strapiRegister function
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

  const updateUser = useCallback(
    async (data: UpdateUser): Promise<User> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedUser = await strapiUpdateUser(data);
        console.log('Updated user:', updatedUser);

        // Merge the updated user data with existing user data to preserve all properties
        setState((prev) => {
          if (prev.user) {
            const mergedUser = { ...prev.user, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(mergedUser));
            return { ...prev, user: mergedUser, loading: false };
          } else {
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { ...prev, user: updatedUser, loading: false };
          }
        });

        // Return the updated user data (API response)
        // This doesn't include the merge as the setState hasn't necessarily applied yet
        return updatedUser;
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
    [], // Remove setUser from dependencies since we're using setState directly
  );

  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await strapiLogout();
      setUser(null);
      setStartup(null);
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error: err.message,
        loading: false,
      }));
      // Even if the server-side logout fails, clear local state
      setUser(null);
      setStartup(null);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [setUser, setStartup]);

  const updateScores = useCallback(async (): Promise<Record<CategoryEnum, number> | null> => {
    // Get current state values to ensure we're working with the latest data
    if (!state.startup) return null;

    const currentStartup = state.startup;

    let startupPatterns: StartupPattern[] = [];
    let patterns: Pattern[] = [];
    try {
      startupPatterns = await strapiGetStartupPatterns(currentStartup.documentId);
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
      time_space: [0, 0],
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
      documentId: currentStartup.documentId,
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
    updateUser,
    updateScores,
    logout,
    isAuthenticated: Boolean(state.user),
    clearError,
    checkTokenExpiration,
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
