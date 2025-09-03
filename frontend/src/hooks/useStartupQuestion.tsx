import { useState, useCallback } from 'react';
import {
    supabaseGetStartupQuestion,
    supabaseFindStartupQuestion,
    supabaseCreateStartupQuestion,
    supabaseUpdateStartupQuestion,
} from '@/lib/supabase';
import { StartupQuestion, StartupQuestionCreate, StartupQuestionUpdate } from '@/types/database';

interface UseStartupQuestion {
    startupQuestion: StartupQuestion | null;
    loading: boolean;
}

interface UseStartupQuestionReturn extends UseStartupQuestion {
    fetchStartupQuestion: (id: string) => Promise<void>;
    findPatternMethod: (
        startupId: string,
        patternId: string,
        methodId: string,
    ) => Promise<void>;
    createStartupQuestion: (createStartupQuestion: StartupQuestionCreate) => Promise<StartupQuestion>;
    updateStartupQuestion: (updateStartupQuestion: StartupQuestionUpdate) => Promise<StartupQuestion>;
}

export default function useStartupQuestion(): UseStartupQuestionReturn {
    const [state, setState] = useState<UseStartupQuestion>({
        startupQuestion: null,
        loading: true,
    });

    const fetchStartupQuestion = useCallback(async (id: string) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const startupQuestion = await supabaseGetStartupQuestion(id);
            setState({ startupQuestion, loading: false });
        } catch (err: unknown) {
            setState(prev => ({ ...prev, loading: false }));
            throw err;
        }
    }, []);

    const findPatternMethod = useCallback(
        async (startupId: string, patternId: string, methodId: string) => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const startupQuestion = await supabaseFindStartupQuestion(
                    startupId,
                    patternId,
                    methodId,
                );
                setState({ startupQuestion, loading: false });
            } catch (err: unknown) {
                setState(prev => ({ ...prev, loading: false }));
                throw err;
            }
        },
        [],
    );

    const createStartupQuestion = useCallback(
        async (createStartupQuestion: StartupQuestionCreate) => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const startupQuestion = await supabaseCreateStartupQuestion(createStartupQuestion);
                setState({ startupQuestion, loading: false });
                return startupQuestion;
            } catch (err: unknown) {
                setState(prev => ({ ...prev, loading: false }));
                throw err;
            }
        },
        [],
    );

    const updateStartupQuestion = useCallback(
        async (updateStartupQuestion: StartupQuestionUpdate) => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const startupQuestion = await supabaseUpdateStartupQuestion(updateStartupQuestion);
                setState({ startupQuestion, loading: false });
                return startupQuestion;
            } catch (err: unknown) {
                setState(prev => ({ ...prev, loading: false }));
                throw err;
            }
        },
        [],
    );

    return {
        fetchStartupQuestion,
        findPatternMethod,
        createStartupQuestion,
        updateStartupQuestion,
        startupQuestion: state.startupQuestion,
        loading: state.loading,
    };
}