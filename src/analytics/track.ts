/**
 * Utility functions for tracking events with Amplitude
 */

/**
 * Helper to check if Amplitude is available and configured
 */
const isAmplitudeAvailable = (): boolean => {
    const enableInDev = import.meta.env.VITE_ENABLE_ANALYTICS_IN_DEV === 'true';
    const shouldEnableAnalytics = import.meta.env.PROD || enableInDev;

    return Boolean(window.amplitude && shouldEnableAnalytics && import.meta.env.VITE_AMPLITUDE_API_KEY);
};

/**
 * Track a custom event in Amplitude
 * @param eventName - Name of the event to track
 * @param eventProperties - Optional properties to include with the event
 */
export function trackEvent(eventName: string, eventProperties?: Record<string, any>): void {
    if (isAmplitudeAvailable()) {
        window.amplitude.track(eventName, eventProperties);
    } else {
        // Log to console in development for debugging
        console.log(`[Amplitude Event]`, { eventName, eventProperties });
    }
}

/**
 * Track page view in Amplitude
 * @param pageName - Name of the page
 * @param pageProperties - Optional properties to include with the page view
 */
export function trackPageView(pageName: string, pageProperties?: Record<string, any>): void {
    trackEvent('page_viewed', {
        page_name: pageName,
        page_url: window.location.pathname,
        ...pageProperties
    });
}

/**
 * Set user properties in Amplitude
 * @param userProperties - User properties to set
 */
export function setUserProperties(userProperties: Record<string, any>): void {
    if (isAmplitudeAvailable()) {
        window.amplitude.setUserProperties(userProperties);
    } else {
        // Log to console in development for debugging
        console.log(`[Amplitude User Properties]`, { userProperties });
    }
}

/**
 * Identify a user in Amplitude
 * @param userId - User ID to identify
 */
export function identifyUser(userId: string): void {
    if (isAmplitudeAvailable()) {
        window.amplitude.setUserId(userId);
    } else {
        // Log to console in development for debugging
        console.log(`[Amplitude User ID]`, { userId });
    }
} 