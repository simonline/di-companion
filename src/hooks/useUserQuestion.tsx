import { useState, useCallback } from 'react';
import {
    strapiGetUserQuestion,
    strapiFindUserQuestion,
    strapiCreateUserQuestion,
    strapiUpdateUserQuestion,
} from '@/lib/strapi';
import type { UserQuestion, CreateUserQuestion, UpdateUserQuestion } from '@/types/strapi';

interface UseUserQuestion {
    userQuestion: UserQuestion | null;
    loading: boolean;
    error: string | null;
}

interface UseUserQuestionReturn extends UseUserQuestion {
    fetchUserQuestion: (documentId: string) => void;
    findPatternMethod: (
        userDocumentId: string,
        patternDocumentId: string,
        methodDocumentId: string,
    ) => void;
    createUserQuestion: (createUserQuestion: CreateUserQuestion) => void;
    updateUserQuestion: (updateUserQuestion: UpdateUserQuestion) => void;
    clearError: () => void;
}

export default function useUserQuestion(): UseUserQuestionReturn {
    const [state, setState] = useState<UseUserQuestion>({
        userQuestion: null,
        loading: true,
        error: null,
    });

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    const fetchUserQuestion = useCallback(async (documentId: string) => {
        try {
            const userQuestion = await strapiGetUserQuestion(documentId);
            setState({ userQuestion, loading: false, error: null });
        } catch (err: unknown) {
            const error = err as Error;
            setState({ userQuestion: null, loading: false, error: error.message });
        }
    }, []);

    const findPatternMethod = useCallback(
        async (userDocumentId: string, patternDocumentId: string, methodDocumentId: string) => {
            try {
                const userQuestion = await strapiFindUserQuestion(
                    userDocumentId,
                    patternDocumentId,
                    methodDocumentId,
                );
                setState({ userQuestion, loading: false, error: null });
            } catch (err: unknown) {
                const error = err as Error;
                setState({ userQuestion: null, loading: false, error: error.message });
            }
        },
        [],
    );

    const createUserQuestion = useCallback(
        async (createUserQuestion: CreateUserQuestion) => {
            try {
                const userQuestion = await strapiCreateUserQuestion(createUserQuestion);
                setState({ userQuestion, loading: false, error: null });
            } catch (err: unknown) {
                const error = err as Error;
                setState({ userQuestion: null, loading: false, error: error.message });
            }
        },
        [],
    );

    const updateUserQuestion = useCallback(
        async (updateUserQuestion: UpdateUserQuestion) => {
            try {
                const userQuestion = await strapiUpdateUserQuestion(updateUserQuestion);
                setState({ userQuestion, loading: false, error: null });
            } catch (err: unknown) {
                const error = err as Error;
                setState({ userQuestion: null, loading: false, error: error.message });
            }
        },
        [],
    );

    return {
        fetchUserQuestion,
        findPatternMethod,
        createUserQuestion,
        updateUserQuestion,
        userQuestion: state.userQuestion,
        loading: state.loading,
        error: state.error,
        clearError,
    };
} 