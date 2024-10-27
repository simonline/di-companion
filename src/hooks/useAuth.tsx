// src/hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { strapiLogin, strapiLogout, strapiRegister } from '@/lib/strapi';
import type { UserData, StrapiRegisterCredentials } from '@/types/strapi';

interface RegistrationData {
  userData: StrapiRegisterCredentials;
  profileData: {
    given_name: string;
    family_name: string;
  };
  startupData: {
    startup_name: string;
    start_date: string;
    co_founders_count: number;
    co_founders_background: string;
    idea_description: string;
    product_type: string;
    industry: string;
    industry_other?: string | null;
    target_market: string;
    phase: string;
    problem_validated: boolean;
    qualified_conversations: number;
    core_target_group_defined: boolean;
    prototype_validated: boolean;
    mvp_tested: boolean;
  };
}

interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserData>;
  register: (data: RegistrationData) => Promise<UserData>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      setState((prev) => ({
        ...prev,
        user: storedUser ? JSON.parse(storedUser) : null,
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

  const setUser = useCallback((userData: UserData | null) => {
    setState((prev) => ({ ...prev, user: userData, error: null }));
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<UserData> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await strapiLogin(email, password);

        const userData: UserData = {
          ...response.user,
        };

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

  const register = useCallback(
    async (data: RegistrationData): Promise<UserData> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await strapiRegister(data.userData, data.profileData, data.startupData);

        const userData: UserData = {
          ...result.auth.user,
          profile: result.profile,
        };

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

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    isAuthenticated: Boolean(state.user),
    clearError,
  };
}

import { createContext, useContext, ReactNode } from 'react';

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
