import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FeatureFlags {
    agent: boolean;
    tools: boolean;
}

const STORAGE_KEY = 'di-companion-feature-flags';

const getInitialFlags = (): FeatureFlags => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Failed to parse stored feature flags:', error);
    }

    // Default values
    return {
        agent: false,
        tools: false,
    };
};

export const useFeatureFlags = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [flags, setFlags] = useState<FeatureFlags>(getInitialFlags);

    // Initialize from localStorage on mount
    useEffect(() => {
        const storedFlags = getInitialFlags();
        setFlags(storedFlags);
    }, []);

    // Update flags when URL params change
    useEffect(() => {
        const urlAgent = searchParams.get('agent');
        const urlTools = searchParams.get('tools');

        // Get current stored flags as fallback
        const storedFlags = getInitialFlags();

        // Only update flags if URL parameters are explicitly set
        // Otherwise, keep the stored values
        const newFlags = {
            agent: urlAgent !== null ? urlAgent === '1' : storedFlags.agent,
            tools: urlTools !== null ? urlTools === '1' : storedFlags.tools,
        };

        setFlags(newFlags);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags));
    }, [searchParams]);

    const toggleAgent = () => {
        const newAgentValue = !flags.agent;
        const newSearchParams = new URLSearchParams(searchParams);

        if (newAgentValue) {
            newSearchParams.set('agent', '1');
        } else {
            newSearchParams.set('agent', '0');
        }

        setSearchParams(newSearchParams);
    };

    const toggleTools = () => {
        const newToolsValue = !flags.tools;
        const newSearchParams = new URLSearchParams(searchParams);

        if (newToolsValue) {
            newSearchParams.set('tools', '1');
        } else {
            newSearchParams.set('tools', '0');
        }

        setSearchParams(newSearchParams);
    };

    const setAgent = (enabled: boolean) => {
        const newSearchParams = new URLSearchParams(searchParams);

        if (enabled) {
            newSearchParams.set('agent', '1');
        } else {
            newSearchParams.set('agent', '0');
        }

        setSearchParams(newSearchParams);
    };

    const setTools = (enabled: boolean) => {
        const newSearchParams = new URLSearchParams(searchParams);

        if (enabled) {
            newSearchParams.set('tools', '1');
        } else {
            newSearchParams.set('tools', '0');
        }

        setSearchParams(newSearchParams);
    };

    // Direct setters that update localStorage without URL parameters
    const setAgentDirect = (enabled: boolean) => {
        const newFlags = { ...flags, agent: enabled };
        setFlags(newFlags);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags));
    };

    const setToolsDirect = (enabled: boolean) => {
        const newFlags = { ...flags, tools: enabled };
        setFlags(newFlags);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags));
    };

    const getCurrentUrl = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        const currentPath = window.location.pathname;
        const queryString = newSearchParams.toString();
        return queryString ? `${currentPath}?${queryString}` : currentPath;
    };

    return {
        flags,
        toggleAgent,
        toggleTools,
        setAgent,
        setTools,
        setAgentDirect,
        setToolsDirect,
        getCurrentUrl,
    };
}; 