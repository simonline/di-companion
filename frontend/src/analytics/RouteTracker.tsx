import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './track';

/**
 * Component that tracks page views when routes change
 */
function RouteTracker() {
    const location = useLocation();

    useEffect(() => {
        // Extract page name from pathname
        const pageName = location.pathname === '/'
            ? 'Home'
            : location.pathname
                .split('/')
                .filter(Boolean)
                .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
                .join(' ');

        // Track page view
        trackPageView(pageName, {
            referrer: document.referrer,
            pathname: location.pathname,
            search: location.search
        });
    }, [location]);

    // This component doesn't render anything
    return null;
}

export default RouteTracker; 