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

    // Check if analytics should be enabled in development mode
    const enableInDev = import.meta.env.VITE_ENABLE_ANALYTICS_IN_DEV === 'true';

    // Enable analytics in production or if explicitly enabled in development
    const shouldEnableAnalytics = import.meta.env.PROD || enableInDev;

    useEffect(() => {
        // Only load Amplitude if analytics should be enabled and we have an API key
        if (shouldEnableAnalytics && amplitudeApiKey) {
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

                    // Log in dev mode that analytics is enabled
                    if (!import.meta.env.PROD && enableInDev) {
                        console.log('[Amplitude] Analytics enabled in development mode');
                    }
                }
            };
            document.head.appendChild(amplitudeScript);
        }

        return () => {
            // Cleanup if needed
            if (shouldEnableAnalytics && amplitudeApiKey) {
                const scriptSelector = `script[src="https://cdn.amplitude.com/script/${amplitudeApiKey}.js"]`;
                document.querySelector(scriptSelector)?.remove();
            }
        };
    }, [amplitudeApiKey, shouldEnableAnalytics, enableInDev]);

    return <>{children}</>;
}

export default AmplitudeProvider; 