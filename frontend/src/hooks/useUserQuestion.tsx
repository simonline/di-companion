import { useState, useCallback } from 'react';
import {
    supabaseGetUserQuestion,
    supabaseFindUserQuestion,
    supabaseCreateUserQuestion,
} from '@/lib/supabase';
import { UserQuestion, UserQuestionCreate } from '@/types/database';

interface UseUserQuestion {
    userQuestion: UserQuestion | null;
    loading: boolean;
}

interface UseUserQuestionReturn extends UseUserQuestion {
    fetchUserQuestion: (id: string) => Promise<void>;
    findPatternMethod: (
        userId: string,
        patternId: string,
        methodId: string,
    ) => Promise<void>;
    createUserQuestion: (createUserQuestion: UserQuestionCreate) => Promise<UserQuestion>;
}

export default function useUserQuestion(): UseUserQuestionReturn {
    const [state, setState] = useState<UseUserQuestion>({
        userQuestion: null,
        loading: true,
    });

    const fetchUserQuestion = useCallback(async (id: string) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const userQuestion = await supabaseGetUserQuestion(id);
            setState({ userQuestion, loading: false });
        } catch (err: unknown) {
            setState(prev => ({ ...prev, loading: false }));
            throw err;
        }
    }, []);

    const findPatternMethod = useCallback(
        async (userId: string, patternId: string, methodId: string) => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const userQuestion = await supabaseFindUserQuestion(
                    userId,
                    patternId,
                    methodId,
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
        async (createUserQuestion: UserQuestionCreate) => {
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

    return {
        fetchUserQuestion,
        findPatternMethod,
        createUserQuestion,
        userQuestion: state.userQuestion,
        loading: state.loading,
    };
} 