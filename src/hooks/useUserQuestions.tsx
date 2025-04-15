import { useState, useCallback } from 'react';
import { strapiGetUserQuestions } from '@/lib/strapi';
import type { UserQuestion } from '@/types/strapi';

interface UseUserQuestions {
    userQuestions: UserQuestion[] | null;
    loading: boolean;
    error: string | null;
}

interface UseUserQuestionsReturn extends UseUserQuestions {
    fetchUserQuestions: (
        userDocumentId?: string,
        patternDocumentId?: string,
        surveyDocumentId?: string,
    ) => void;
    clearError: () => void;
    clearUserQuestions: () => void;
}

export default function useUserQuestions(): UseUserQuestionsReturn {
    const [state, setState] = useState<UseUserQuestions>({
        userQuestions: null,
        loading: true,
        error: null,
    });

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    const clearUserQuestions = useCallback(() => {
        setState((prev) => ({ ...prev, userQuestions: null }));
    }, []);

    const fetchUserQuestions = useCallback(
        async (userDocumentId?: string, patternDocumentId?: string, surveyDocumentId?: string) => {
            try {
                const userQuestions = await strapiGetUserQuestions(
                    userDocumentId,
                    patternDocumentId,
                    surveyDocumentId,
                );
                setState({ userQuestions, loading: false, error: null });
            } catch (err: unknown) {
                const error = err as Error;
                setState({ userQuestions: null, loading: false, error: error.message });
            }
        },
        [],
    );

    return {
        fetchUserQuestions,
        userQuestions: state.userQuestions,
        loading: state.loading,
        error: state.error,
        clearError,
        clearUserQuestions,
    };
} 