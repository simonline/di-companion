import { createContext, useContext, useState, ReactNode } from 'react';
import { Tables } from '@/types/database';

interface CurrentPatternContextType {
    currentPattern: Tables<'patterns'> | null;
    setCurrentPattern: (pattern: Tables<'patterns'> | null) => void;
}

const CurrentPatternContext = createContext<CurrentPatternContextType | undefined>(undefined);

export const useCurrentPattern = () => {
    const context = useContext(CurrentPatternContext);
    if (context === undefined) {
        throw new Error('useCurrentPattern must be used within a CurrentPatternProvider');
    }
    return context;
};

interface CurrentPatternProviderProps {
    children: ReactNode;
}

export const CurrentPatternProvider: React.FC<CurrentPatternProviderProps> = ({ children }) => {
    const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);

    return (
        <CurrentPatternContext.Provider value={{ currentPattern, setCurrentPattern }}>
            {children}
        </CurrentPatternContext.Provider>
    );
}; 