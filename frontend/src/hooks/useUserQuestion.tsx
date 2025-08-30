import { useState, useCallback } from 'react';
import {
    supabaseGetUserQuestion,
    supabaseFindUserQuestion,
    supabaseCreateUserQuestion,
    supabaseUpdateUserQuestion,
} from '@/lib/supabase';
import type { UserQuestion, CreateUserQuestion, UpdateUserQuestion } from '@/types/supabase';

interface UseUserQuestion {
    userQuestion: UserQuestion | null;
    loading: boolean;
}

interface UseUserQuestionReturn extends UseUserQuestion {
    fetchUserQuestion: (documentId: string) => Promise<void>;
    findPatternMethod: (
        userDocumentId: string,
        patternDocumentId: string,
        methodDocumentId: string,
    ) => Promise<void>;
    createUserQuestion: (createUserQuestion: CreateUserQuestion) => Promise<UserQuestion>;
    updateUserQuestion: (updateUserQuestion: UpdateUserQuestion) => Promise<UserQuestion>;
}

export default function useUserQuestion(): UseUserQuestionReturn {
    const [state, setState] = useState<UseUserQuestion>({
        userQuestion: null,
        loading: true,
    });

    const fetchUserQuestion = useCallback(async (documentId: string) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const userQuestion = await supabaseGetUserQuestion(documentId);
            setState({ userQuestion, loading: false });
        } catch (err: unknown) {
            setState(prev => ({ ...prev, loading: false }));
            throw err;
        }
    }, []);

    const findPatternMethod = useCallback(
        async (userDocumentId: string, patternDocumentId: string, methodDocumentId: string) => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const userQuestion = await supabaseFindUserQuestion(
                    userDocumentId,
                    patternDocumentId,
                    methodDocumentId,
                );
                setState({ userQuestion, loading: false });
            } catch (err: unknown) {
                setState(prev => ({ ...prev, loading: false }));
                throw err;
            }
        },
        [],
    );

    const createUserQuestion = useCallback(
        async (createUserQuestion: CreateUserQuestion) => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const userQuestion = await supabaseCreateUserQuestion(createUserQuestion);
                setState({ userQuestion, loading: false });
                return userQuestion;
            } catch (err: unknown) {
                setState(prev => ({ ...prev, loading: false }));
                throw err;
            }
        },
        [],
    );

    const updateUserQuestion = useCallback(
        async (updateUserQuestion: UpdateUserQuestion) => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const userQuestion = await supabaseUpdateUserQuestion(updateUserQuestion);
                setState({ userQuestion, loading: false });
                return userQuestion;
            } catch (err: unknown) {
                setState(prev => ({ ...prev, loading: false }));
                throw err;
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
    };
} 