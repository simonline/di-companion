import { useState, useCallback } from 'react';
import {
    supabaseGetUserQuestion,
    supabaseFindUserQuestion,
    supabaseCreateUserQuestion,
    supabaseUpdateUserQuestion,
} from '@/lib/supabase';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database';

interface UseUserQuestion {
    userQuestion: Tables<'user_questions'> | null;
    loading: boolean;
}

interface UseUserQuestionReturn extends UseUserQuestion {
    fetchUserQuestion: (id: string) => Promise<void>;
    findPatternMethod: (
        userId: string,
        patternId: string,
        methodId: string,
    ) => Promise<void>;
    createUserQuestion: (createUserQuestion: TablesInsert<'user_questions'>) => Promise<Tables<'user_questions'>>;
    updateUserQuestion: (updateUserQuestion: TablesUpdate<'user_questions'>) => Promise<Tables<'user_questions'>>;
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
        async (createUserQuestion: TablesInsert<'user_questions'>) => {
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
        async (updateUserQuestion: TablesUpdate<'user_questions'>) => {
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