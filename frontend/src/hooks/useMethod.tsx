import { useState, useCallback } from 'react';
import { strapiGetMethod } from '@/lib/strapi';
import type { Method } from '@/types/strapi';

interface UseMethod {
    method: Method | null;
    loading: boolean;
    error: string | null;
}

interface UseMethodReturn extends UseMethod {
    fetchMethod: (documentId: string) => void;
    clearError: () => void;
}

export default function useMethod(): UseMethodReturn {
    const [state, setState] = useState<UseMethod>({
        method: null,
        loading: true,
        error: null,
    });

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    const fetchMethod = useCallback(async (documentId: string) => {
        try {
            const method = await strapiGetMethod(documentId);
            setState({ method, loading: false, error: null });
        } catch (err: unknown) {
            const error = err as Error;
            setState({ method: null, loading: false, error: error.message });
        }
    }, []);

    return {
        fetchMethod,
        method: state.method,
        loading: state.loading,
        error: state.error,
        clearError,
    };
} 