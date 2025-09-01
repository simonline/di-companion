import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  supabaseGetStartupPatterns,
  supabaseGetPatterns,
  supabaseGetStartup,
  supabaseGetUserStartups,
  supabaseMe,
  supabaseLogin,
  supabaseLogout,
  supabaseRegister,
  supabaseCreateProfile,
  supabaseCreateStartup,
  supabaseUpdateStartup,
  supabaseUpdateProfile,
  supabaseSendOtp,
  supabaseSendMagicLink,
  supabaseVerifyOtp,
  getSession,
} from '@/lib/supabase';
import {
  Pattern,
  Profile,
  ProfileCreate,
  ProfileUpdate,
  Startup,
  StartupCreate,
  StartupPattern,
  StartupUpdate,
  User,
} from '@/types/database';
import type { CategoryEnum } from '@/utils/constants';
import { supabase } from '@/lib/supabase';
import { identifyUser } from '@/analytics/track';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  startup: Startup | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (identifier: string, password: string) => Promise<User>;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  register: (data: { email: string; acceptedPrivacyPolicy?: boolean; captchaToken?: string }) => Promise<{ id: string; email: string }>;
  createProfile: (data: ProfileCreate) => Promise<Profile>;
  createStartup: (data: StartupCreate) => Promise<Startup>;
  updateStartup: (data: StartupUpdate) => Promise<Startup>;
  updateProfile: (data: ProfileUpdate) => Promise<Profile>;
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
    profile: null,
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


  const setUserAndProfile = useCallback((userData: User | null, profileData: Profile | null) => {
    setState((prev) => ({ ...prev, user: userData, profile: profileData, error: null }));
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      identifyUser(userData.id);
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

  // Setup event listener for auth state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          setUserAndProfile(null, null);
          setStartup(null);
        }
      }
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth hook: SIGNED_IN event, fetching user data...');
        // Refresh user data when signed in
        try {
          const { user, profile } = await supabaseMe();
          console.log('Auth hook: User data fetched:', user, profile);
          setUserAndProfile(user, profile);
          // Query startups separately
          if (user) {
            const { data: startupLinks } = await supabase
              .from('startups_users_lnk')
              .select('startup_id')
              .eq('user_id', user.id)
              .limit(1);
            if (startupLinks && startupLinks.length > 0) {
              const startup = await supabaseGetStartup(startupLinks[0].startup_id!);
              setStartup(startup);
            }
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
        // Instead of calling logout, just clear the auth state
        setUserAndProfile(null, null);
        setStartup(null);
        await supabase.auth.signOut();
      }
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(tokenCheckInterval);
    };
  }, [setUserAndProfile, setStartup, checkTokenExpiration, state.user]);

  // Initialize user/startup from localStorage first, then validate with Supabase session
  // Note: We intentionally omit setUser and setStartup from deps to avoid infinite loops
  useEffect(() => {
    const initAuth = async () => {
      // First, check if we have a Supabase session (this reads from localStorage automatically)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // If we have a valid session, try to load cached user data first for instant UI
      if (session && !sessionError) {
        // Try to load from localStorage for immediate hydration
        const storedUser = localStorage.getItem('user');
        const storedStartup = localStorage.getItem('startup');

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const parsedStartup = storedStartup ? JSON.parse(storedStartup) : null;

            // Set the stored data immediately for faster UI
            setState((prev) => ({
              ...prev,
              user: parsedUser,
              startup: parsedStartup,
              loading: false, // Don't block UI with cached data
              error: null,
            }));

            // Now fetch fresh data in the background
            try {
              const { user, profile } = await supabaseMe();
              setUserAndProfile(user, profile);

              let startup: Startup | null = null;
              if (user) {
                const { data: startupLinks } = await supabase
                  .from('startups_users_lnk')
                  .select('startup_id')
                  .eq('user_id', user.id)
                  .limit(1);
                if (startupLinks && startupLinks.length > 0) {
                  startup = await supabaseGetStartup(startupLinks[0].startup_id!);
                }
              }
              setStartup(startup);
            } catch (error) {
              console.error('Failed to refresh user data:', error);
              // Don't clear the cached data on refresh failure
            }
          } catch (e) {
            // Invalid localStorage data, try to fetch fresh
            console.error('Invalid cached data:', e);
            localStorage.removeItem('user');
            localStorage.removeItem('startup');

            // Try to fetch fresh data
            try {
              const { user, profile } = await supabaseMe();
              setUserAndProfile(user, profile);

              let startup: Startup | null = null;
              if (user) {
                const { data: startupLinks } = await supabase
                  .from('startups_users_lnk')
                  .select('startup_id')
                  .eq('user_id', user.id)
                  .limit(1);
                if (startupLinks && startupLinks.length > 0) {
                  startup = await supabaseGetStartup(startupLinks[0].startup_id!);
                }
              }
              setStartup(startup);
              setState((prev) => ({ ...prev, loading: false }));
            } catch (error) {
              console.error('Failed to fetch user data:', error);
              setState((prev) => ({
                ...prev,
                user: null,
                startup: null,
                loading: false,
                error: null,
              }));
            }
          }
        } else {
          // No cached data but we have a session, fetch fresh data
          try {
            const { user, profile } = await supabaseMe();
            setUserAndProfile(user, profile);

            let startup: Startup | null = null;
            if (user?.id) {
              const userStartups = await supabaseGetUserStartups(user.id);
              if (userStartups.length > 0) {
                startup = userStartups[0];
              }
            }
            setStartup(startup);
            setState((prev) => ({ ...prev, loading: false }));
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            setState((prev) => ({
              ...prev,
              user: null,
              startup: null,
              loading: false,
              error: null,
            }));
          }
        }
      } else {
        // No session, clear everything
        setState((prev) => ({
          ...prev,
          user: null,
          startup: null,
          loading: false,
          error: null,
        }));
        localStorage.removeItem('user');
        localStorage.removeItem('startup');
      }
    };

    initAuth();
  }, [setUserAndProfile, setStartup]);


  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(
    async (identifier: string, password: string): Promise<User> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { user, profile } = await supabaseLogin(identifier, password);
        // Session is now handled by Supabase
        setUserAndProfile(user, profile);
        let startup: Startup | null = null;
        if (user?.id) {
          const userStartups = await supabaseGetUserStartups(user.id);
          if (userStartups.length > 0) {
            startup = userStartups[0];
          }
        }
        setStartup(startup);
        return user;
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
    [setUserAndProfile, setStartup],
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
        const { user, profile } = await supabaseVerifyOtp(email, token);
        setUserAndProfile(user, profile);
        if (user) {
          const { data: startupLinks } = await supabase
            .from('startups_users_lnk')
            .select('startup_id')
            .eq('user_id', user.id)
            .limit(1);
          if (startupLinks && startupLinks.length > 0) {
            const startup = await supabaseGetStartup(startupLinks[0].startup_id!);
            setStartup(startup);
          }
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
    [setUserAndProfile, setStartup],
  );

  // Simplified registration - just email and password
  const register = useCallback(
    async (data: { email: string; acceptedPrivacyPolicy?: boolean; captchaToken?: string }): Promise<{ id: string; email: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await supabaseRegister(data);
        // User is created but no profile yet - magic link sent to email
        return result.user;
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

  // Create profile after email confirmation
  const createProfile = useCallback(
    async (data: ProfileCreate): Promise<Profile> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!state.user?.id) {
          throw new Error('User must be logged in to create profile');
        }
        const profile = await supabaseCreateProfile({ ...data, id: state.user.id });
        setUserAndProfile(state.user, profile);
        return profile;
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
    [state.user, setUserAndProfile],
  );

  const createStartup = useCallback(
    async (data: StartupCreate): Promise<Startup> => {
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
    async (data: StartupUpdate): Promise<Startup> => {
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

  const updateProfile = useCallback(
    async (data: ProfileUpdate): Promise<Profile> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedProfile = await supabaseUpdateProfile(data);
        console.log('Updated profile:', updatedProfile);

        // Merge the updated user data with existing user data to preserve all properties
        setState((prev: any) => {
          if (prev.user) {
            const mergedProfile = { ...prev.profile, ...updatedProfile };
            localStorage.setItem('user', JSON.stringify(mergedProfile));
            return { ...prev, profile: mergedProfile, loading: false };
          } else {
            localStorage.setItem('user', JSON.stringify(updatedProfile));
            return { ...prev, user: updatedProfile, loading: false };
          }
        });

        // Return the updated user data (API response)
        // This doesn't include the merge as the setState hasn't necessarily applied yet
        return updatedProfile as Profile;
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
      setUserAndProfile(null, null);
      setStartup(null);
    } catch (error) {
      const err = error as Error;
      setState((prev) => ({
        ...prev,
        error: err.message,
        loading: false,
      }));
      // Even if the server-side logout fails, clear local state
      setUserAndProfile(null, null);
      setStartup(null);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [setUserAndProfile, setStartup]);

  const updateScores = useCallback(async (): Promise<Record<CategoryEnum, number> | null> => {
    // Get current state values to ensure we're working with the latest data
    if (!state.startup) return null;

    const currentStartup = state.startup;

    let startupPatterns: StartupPattern[] = [];
    let patterns: Pattern[] = [];
    try {
      startupPatterns = await supabaseGetStartupPatterns(currentStartup.id || currentStartup.id);
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
        pattern.category && Array.isArray(currentStartup.categories) && currentStartup.categories.includes(pattern.category as CategoryEnum)
      );
      startupPatterns = startupPatterns.filter((startupPattern: StartupPattern) =>
        startupPattern.pattern?.category && Array.isArray(currentStartup.categories) && currentStartup.categories.includes(startupPattern.pattern.category)
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
      categoryPoints[startupPattern.pattern?.category as CategoryEnum][0] += startupPattern.points || 0;
    });
    console.log(categoryPoints);

    // Get total points available for each category
    patterns.forEach((pattern) => {
      if (!pattern.category) return;
      categoryPoints[pattern.category as CategoryEnum][1] += 5;
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
      id: currentStartup.id || currentStartup.id,
      scores: maturityScores,
      score: totalScore,
    });

    return maturityScores;
  }, [state.startup, updateStartup]);

  const refreshData = useCallback(async () => {
    console.log('Refreshing data');
    try {
      const userData = await supabaseMe();
      let startup: Startup | null = null;

      // Fetch user's startups separately
      if (userData.user?.id) {
        const startups = await supabaseGetUserStartups(userData.user.id);
        if (startups.length > 0) {
          startup = await supabaseGetStartup(startups[0].id);
        }
      }

      console.log(startup);
      setState((prev) => ({ ...prev, user: userData.user, profile: userData.profile, startup, loading: false }));
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
    createProfile,
    createStartup,
    updateStartup,
    updateProfile,
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
