import { ReactNode, useEffect } from 'react';

// TypeScript declarations for Amplitude
declare global {
    interface Window {
        amplitude: {
            add: (plugin: any) => void;
            init: (apiKey: string, config: any) => void;
            track: (eventName: string, eventProperties?: Record<string, any>) => void;
            setUserProperties: (userProperties: Record<string, any>) => void;
            setUserId: (userId: string) => void;
        };
        sessionReplay: {
            plugin: (config: { sampleRate: number }) => any;
        };
    }
}

interface AmplitudeProviderProps {
    children: ReactNode;
    apiKey?: string;
}

export function AmplitudeProvider({ children, apiKey }: AmplitudeProviderProps) {
    // Use the provided API key or fall back to environment variable
    const amplitudeApiKey = apiKey || import.meta.env.VITE_AMPLITUDE_API_KEY;

    useEffect(() => {
        // Only load Amplitude in production to avoid tracking during development
        // Also ensure we have an API key
        if (import.meta.env.PROD && amplitudeApiKey) {
            // Load Amplitude script
            const amplitudeScript = document.createElement('script');
            amplitudeScript.src = `https://cdn.amplitude.com/script/${amplitudeApiKey}.js`;
            amplitudeScript.async = true;
            amplitudeScript.onload = () => {
                // Initialize Amplitude after script loads
                if (window.amplitude) {
                    window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
                    window.amplitude.init(amplitudeApiKey, {
                        fetchRemoteConfig: true,
                        autocapture: true,
                    });
                }
            };
            document.head.appendChild(amplitudeScript);
        }

        return () => {
            // Cleanup if needed
            if (import.meta.env.PROD && amplitudeApiKey) {
                const scriptSelector = `script[src="https://cdn.amplitude.com/script/${amplitudeApiKey}.js"]`;
                document.querySelector(scriptSelector)?.remove();
            }
        };
    }, [amplitudeApiKey]);

    return <>{children}</>;
}

export default AmplitudeProvider; 