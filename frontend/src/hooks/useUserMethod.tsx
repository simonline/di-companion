import { useState, useCallback, useEffect } from 'react';
import { 
  supabaseGetUserMethod, 
  supabaseGetUserMethodByName,
  supabaseCreateUserMethod,
  supabaseUpdateUserMethod,
  supabaseGetMethodByName 
} from '@/lib/supabase';
import { UserMethod, UserMethodCreate, UserMethodUpdate, UserValuesData, Method } from '@/types/database';

interface UseUserMethod {
  userMethod: UserMethod | null;
  valuesData: UserValuesData | null;
  method: Method | null;
  loading: boolean;
  error: string | null;
}

interface UseUserMethodReturn extends UseUserMethod {
  fetchUserMethod: (id: string) => Promise<void>;
  fetchUserMethodByName: (userId: string, methodName: string) => Promise<void>;
  fetchOrCreateUserMethod: (userId: string, methodName: string, startupId?: string) => Promise<void>;
  saveUserMethod: (userMethod: UserMethodCreate | UserMethodUpdate) => Promise<UserMethod>;
  saveValuesData: (valuesData: UserValuesData, startupId?: string) => Promise<void>;
  clearError: () => void;
}

export default function useUserMethod(): UseUserMethodReturn {
  const [state, setState] = useState<UseUserMethod>({
    userMethod: null,
    valuesData: null,
    method: null,
    loading: false,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchUserMethod = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const userMethod = await supabaseGetUserMethod(id);
      const valuesData = userMethod.result_text ? JSON.parse(userMethod.result_text) : null;
      setState({ userMethod, valuesData, method: null, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ userMethod: null, valuesData: null, method: null, loading: false, error: error.message });
    }
  }, []);

  const fetchUserMethodByName = useCallback(async (userId: string, methodName: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // First get the method by name to get its ID
      const method = await supabaseGetMethodByName(methodName);
      if (!method) {
        throw new Error(`Method '${methodName}' not found. Please ensure it exists in the methods table.`);
      }
      
      // Then get the user's data for this method
      const userMethod = await supabaseGetUserMethodByName(userId, method.id);
      const valuesData = userMethod?.result_text ? JSON.parse(userMethod.result_text) : null;
      setState({ userMethod, valuesData, method, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ userMethod: null, valuesData: null, method: null, loading: false, error: error.message });
    }
  }, []);

  const fetchOrCreateUserMethod = useCallback(async (userId: string, methodName: string, startupId?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // First get the method by name to get its ID
      const method = await supabaseGetMethodByName(methodName);
      if (!method) {
        throw new Error(`Method '${methodName}' not found. Please ensure it exists in the methods table.`);
      }
      
      // Then get the user's data for this method
      let userMethod = await supabaseGetUserMethodByName(userId, method.id);
      
      // If no user method exists, create an empty one
      if (!userMethod) {
        const emptyData: UserValuesData = {
          top15Values: [],
          final7Values: [],
          pairwiseChoices: {},
          valueScores: []
        };
        
        userMethod = await supabaseCreateUserMethod({
          user_id: userId,
          method_id: method.id,
          startup_id: startupId || null,
          result_text: JSON.stringify(emptyData),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      const valuesData = userMethod.result_text ? JSON.parse(userMethod.result_text) : null;
      setState({ userMethod, valuesData, method, loading: false, error: null });
    } catch (err: unknown) {
      const error = err as Error;
      setState({ userMethod: null, valuesData: null, method: null, loading: false, error: error.message });
    }
  }, []);

  const saveUserMethod = useCallback(async (userMethod: UserMethodCreate | UserMethodUpdate): Promise<UserMethod> => {
    try {
      let savedMethod: UserMethod;
      if ('id' in userMethod && userMethod.id) {
        savedMethod = await supabaseUpdateUserMethod(userMethod as UserMethodUpdate);
      } else {
        savedMethod = await supabaseCreateUserMethod(userMethod as UserMethodCreate);
      }
      
      const valuesData = savedMethod.result_text ? JSON.parse(savedMethod.result_text) : null;
      setState((prev) => ({ 
        ...prev, 
        userMethod: savedMethod,
        valuesData 
      }));
      return savedMethod;
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw err;
    }
  }, []);

  const saveValuesData = useCallback(async (valuesData: UserValuesData, startupId?: string) => {
    if (!state.userMethod) {
      throw new Error('No user method loaded to save values to');
    }

    try {
      const updatePayload: UserMethodUpdate = {
        id: state.userMethod.id,
        result_text: JSON.stringify(valuesData),
        updated_at: new Date().toISOString()
      };
      
      // Only update startup_id if it's provided and different
      if (startupId !== undefined && startupId !== state.userMethod.startup_id) {
        updatePayload.startup_id = startupId;
      }
      
      const updatedMethod = await supabaseUpdateUserMethod(updatePayload);
      
      setState((prev) => ({ 
        ...prev, 
        userMethod: updatedMethod,
        valuesData 
      }));
    } catch (err: unknown) {
      const error = err as Error;
      setState((prev) => ({ ...prev, error: error.message }));
      throw err;
    }
  }, [state.userMethod]);

  return {
    fetchUserMethod,
    fetchUserMethodByName,
    fetchOrCreateUserMethod,
    saveUserMethod,
    saveValuesData,
    userMethod: state.userMethod,
    valuesData: state.valuesData,
    method: state.method,
    loading: state.loading,
    error: state.error,
    clearError,
  };
}