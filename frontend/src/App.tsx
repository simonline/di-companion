import { Fragment } from 'react';
import { BrowserRouter } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/source-sans-pro/400.css'; // Regular weight
import '@fontsource/source-sans-pro/600.css'; // Semi-bold weight
import '@fontsource/source-sans-pro/700.css'; // Bold weight
import '@fontsource/source-sans-pro/900.css'; // Black weight

import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';
import Pages from '@/routes/Pages';
import Notifications from '@/sections/Notifications';
import SW from '@/sections/SW';
import Menu from '@/sections/Menu';
import { AuthProvider } from '@/hooks/useAuth';
import { CurrentPatternProvider } from '@/hooks/useCurrentPattern';
import { ChatProvider } from '@/components/Chat/ChatContext';
import AmplitudeProvider from '@/analytics/AmplitudeProvider';
import RouteTracker from '@/analytics/RouteTracker';
import CookieBanner from '@/components/CookieBanner';

function App() {
  return (
    <Fragment>
      <CssBaseline />
      <Notifications />
      <SW />
      <AmplitudeProvider>
        <AuthProvider>
          <CurrentPatternProvider>
            <ChatProvider>
              <BrowserRouter>
                <Pages />
                <Menu />
                <RouteTracker />
                <CookieBanner />
              </BrowserRouter>
            </ChatProvider>
          </CurrentPatternProvider>
        </AuthProvider>
      </AmplitudeProvider>
    </Fragment>
  );
}

export default withErrorHandler(App, AppErrorBoundaryFallback);
