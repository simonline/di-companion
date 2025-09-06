import { useState, useCallback, useEffect } from 'react';
import { 
  supabaseGetUserMethods, 
  supabaseCreateUserMethod, 
  supabaseUpdateUserMethod 
} from '@/lib/supabase';
import { UserMethod, UserMethodCreate, UserMethodUpdate } from '@/types/database';

interface UseUserMethods {
  userMethods: UserMethod[] | null;
  loading: boolean;
  error: string | null;
}

interface UseUserMethodsReturn extends UseUserMethods {
  fetchUserMethods: (userId?: string, methodId?: string, startupId?: string) => Promise<void>;
  createUserMethod: (userMethod: UserMethodCreate) => Promise<UserMethod>;
  updateUserMethod: (userMethod: UserMethodUpdate) => Promise<UserMethod>;
  clearError: () => void;
}

export default function useUserMethods(): UseUserMethodsReturn {
  const [state, setState] = useState<UseUserMethods>({
    userMethods: null,
    loading: false,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchUserMethods = useCallback(async (userId?: string, methodId?: string, startupId?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const userMethods = await supabaseGetUserMethods(userId, methodId, startupId);
      setState({ userMethods, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ userMethods: null, loading: false, error: error.message });
    }
  }, []);

  const createUserMethod = useCallback(async (userMethod: UserMethodCreate): Promise<UserMethod> => {
    try {
      const newUserMethod = await supabaseCreateUserMethod(userMethod);
      setState((prev) => ({
        ...prev,
        userMethods: prev.userMethods ? [...prev.userMethods, newUserMethod] : [newUserMethod],
      }));
      return newUserMethod;
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw err;
    }
  }, []);

  const updateUserMethod = useCallback(async (userMethod: UserMethodUpdate): Promise<UserMethod> => {
    try {
      const updatedUserMethod = await supabaseUpdateUserMethod(userMethod);
      setState((prev) => ({
        ...prev,
        userMethods: prev.userMethods?.map((um) => 
          um.id === updatedUserMethod.id ? updatedUserMethod : um
        ) || null,
      }));
      return updatedUserMethod;
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw err;
    }
  }, []);

  return {
    fetchUserMethods,
    createUserMethod,
    updateUserMethod,
    userMethods: state.userMethods,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}