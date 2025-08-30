import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  supabaseGetStartupPatterns,
  supabaseGetPatterns,
  supabaseGetStartup,
  supabaseMe,
  supabaseLogin,
  supabaseLogout,
  supabaseRegister,
  supabaseCreateStartup,
  supabaseUpdateStartup,
  supabaseUpdateUser,
  supabaseSendOtp,
  supabaseVerifyOtp,
  getSession,
} from '@/lib/supabase';
import type {
  CreateStartup,
  Startup,
  User,
  UserRegistration,
  StartupPattern,
  Pattern,
  UpdateStartup,
  UpdateUser,
} from '@/types/supabase';
import type { CategoryEnum } from '@/utils/constants';
import { supabase } from '@/lib/supabase';
import { identifyUser } from '@/analytics/track';

interface AuthState {
  user: User | null;
  startup: Startup | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (identifier: string, password: string) => Promise<User>;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  register: (data: UserRegistration) => Promise<User>;
  createStartup: (data: CreateStartup) => Promise<Startup>;
  updateStartup: (data: UpdateStartup) => Promise<Startup>;
  updateUser: (data: UpdateUser) => Promise<User>;
  updateScores: () => Promise<Record<CategoryEnum, number> | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
  checkTokenExpiration: () => Promise<boolean>;
  refreshData: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    startup: null,
    loading: true,
    error: null,
  });

  // Function to check if the Supabase session is expired
  const checkTokenExpiration = useCallback(async (): Promise<boolean> => {
    const session = await getSession();
    if (!session) return true;

    const now = Math.floor(Date.now() / 1000);
    return session.expires_at ? session.expires_at < now : true;
  }, []);

  // Setup event listener for auth state changes
  useEffect(() => {
    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setStartup(null);
        }
      }
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth hook: SIGNED_IN event, fetching user data...');
        // Refresh user data when signed in
        try {
          const userData = await supabaseMe();
          console.log('Auth hook: User data fetched:', userData.email);
          setUser(userData);
          if (userData.startups?.length > 0) {
            const startup = await supabaseGetStartup(userData.startups[0].documentId);
            setStartup(startup);
          }
          setState((prev) => ({ ...prev, loading: false }));
        } catch (error) {
          setState((prev) => ({ ...prev, loading: false, error: 'Failed to load user data' }));
        }
      }
    });

    // Periodically check token expiration (every minute)
    const tokenCheckInterval = setInterval(async () => {
      const isExpired = await checkTokenExpiration();
      if (isExpired && state.user) {
        console.log('Token expired, logging out...');
        await logout();
      }
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(tokenCheckInterval);
    };
  }, [checkTokenExpiration, state.user]);

  // Initialize user/startup from Supabase session
  useEffect(() => {
    const initAuth = async () => {
      setState((prev) => ({ ...prev, loading: true }));

      try {
        // Use getSession() first - it's faster and doesn't make a network request
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // No authenticated user, clear state and set loading to false
          setState((prev) => ({
            ...prev,
            user: null,
            startup: null,
            loading: false,
            error: null,
          }));
          localStorage.removeItem('user');
          localStorage.removeItem('startup');
          return;
        }

        // User is authenticated, get full user data
        const userData = await supabaseMe();
        setUser(userData);

        let startup: Startup | null = null;
        if (userData.startups?.length > 0) {
          startup = await supabaseGetStartup(userData.startups[0].documentId);
        }
        setStartup(startup);
        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('Auth initialization error:', error);
        // On error, clear auth state and set loading to false
        setState((prev) => ({
          ...prev,
          user: null,
          startup: null,
          loading: false,
          error: null, // Don't show error for initial load failures
        }));
        localStorage.removeItem('user');
        localStorage.removeItem('startup');
      }
    };

    initAuth();
  }, []);

  const setUser = useCallback((userData: User | null) => {
    setState((prev) => ({ ...prev, user: userData, error: null }));
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      identifyUser(userData.id.toString());
    } else {
      localStorage.removeItem('user');
      identifyUser("");
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
        const { user: userData } = await supabaseLogin(identifier, password);
        // Session is now handled by Supabase
        setUser(userData);
        let startup: Startup | null = null;
        if (userData.startups?.length > 0) {
          startup = await supabaseGetStartup(userData.startups[0].documentId);
        }
        setStartup(startup);
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

  const sendOtp = useCallback(
    async (email: string): Promise<{ success: boolean; message: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await supabaseSendOtp(email);
        return result;
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
    [],
  );

  const verifyOtp = useCallback(
    async (email: string, token: string): Promise<void> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { user: userData } = await supabaseVerifyOtp(email, token);
        setUser(userData);
        if (userData.startups?.length > 0) {
          const startup = await supabaseGetStartup(userData.startups[0].documentId);
          setStartup(startup);
        }
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
        const result = await supabaseRegister(data);
        // JWT token is stored by supabaseRegister function
        const userData: User = result.user;
        // setUser(userData);
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
    [],
  );

  const createStartup = useCallback(
    async (data: CreateStartup): Promise<Startup> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const startup = await supabaseCreateStartup(data);
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
        const startup = await supabaseUpdateStartup(data);
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
        const updatedUser = await supabaseUpdateUser(data);
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
      await supabaseLogout();
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
      startupPatterns = await supabaseGetStartupPatterns(currentStartup.documentId);
      patterns = await supabaseGetPatterns();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch next pattern',
      }));
    }

    // Filter patterns by categories if specified
    if (currentStartup.categories && Array.isArray(currentStartup.categories) && currentStartup.categories.length > 0) {
      patterns = patterns.filter(pattern =>
        pattern.category && currentStartup.categories?.includes(pattern.category)
      );
      startupPatterns = startupPatterns.filter(startupPattern =>
        startupPattern.pattern?.category && currentStartup.categories?.includes(startupPattern.pattern.category)
      );
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
      if (!startupPattern.pattern?.category) return;
      console.log(startupPattern.pattern?.category);
      categoryPoints[startupPattern.pattern?.category][0] += startupPattern.points;
    });
    console.log(categoryPoints);

    // Get total points available for each category
    patterns.forEach((pattern) => {
      if (!pattern.category) return;
      categoryPoints[pattern.category][1] += 5;
    });

    // Calculate the performance score for each category
    const categoryScores = Object.entries(categoryPoints).map(
      ([category, [pointsAchieved, totalPoints]]) => [
        category as CategoryEnum,
        // Round score to 2 decimal places
        Math.round((pointsAchieved / totalPoints) * 100),
      ],
    );
    const maturityScores = Object.fromEntries(categoryScores);
    console.log(maturityScores);

    // Calculate the total score (average of categories with available points)
    const categoriesWithPoints = Object.entries(categoryPoints).filter(
      ([, [, totalPoints]]) => totalPoints > 0
    );

    const totalScore = categoriesWithPoints.length > 0
      ? Math.round(
        categoriesWithPoints.reduce((sum, [, [pointsAchieved, totalPoints]]) =>
          sum + Math.round((pointsAchieved / totalPoints) * 100), 0
        ) / categoriesWithPoints.length
      )
      : 0;

    // Update the startup with the new scores
    updateStartup({
      documentId: currentStartup.documentId,
      scores: maturityScores,
      score: totalScore,
    });

    return maturityScores;
  }, [state.startup, updateStartup]);

  const refreshData = useCallback(async () => {
    console.log('Refreshing data');
    try {
      const user = await supabaseMe();
      let startup: Startup | null = null;
      if (user.startups?.length > 0) {
        startup = await supabaseGetStartup(user.startups[0].documentId);
      }
      console.log(startup);
      setState((prev) => ({ ...prev, user, startup, loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    login,
    sendOtp,
    verifyOtp,
    register,
    createStartup,
    updateStartup,
    updateUser,
    updateScores,
    logout,
    isAuthenticated: !!state.user,
    clearError,
    checkTokenExpiration,
    refreshData,
  };
}

const AuthContext = createContext<UseAuthReturn | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Remove the extra session check - the useAuth hook already handles this
  // in its initialization useEffect

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
