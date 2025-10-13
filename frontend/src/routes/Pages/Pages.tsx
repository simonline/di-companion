import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AppRoutes } from '@/routes/types';
import useRoutes from '..';
// import { getPageHeight } from './utils'; // Unused
import ProtectedRoute from '../ProtectedRoute';
import { useAuthContext } from '@/hooks/useAuth';
import { AgentLayout } from '@/components/AgentLayout';

function Pages() {
  const routes = useRoutes();
  const { profile } = useAuthContext();
  const isCoach = profile?.is_coach || false;

  return (
    <Box sx={{
      height: '100vh',
      overflowY: 'auto',
      position: 'relative',
      paddingBottom: '80px' // Add padding for bottom navigation
    }}>
      <Routes>
        {Object.values(routes as AppRoutes)
          .filter((route) => route.visibleTo.includes(isCoach ? 'coach' : 'startup'))
          .map(({ path, component: Component, requiresAuth, requiresNotAuthenticated, requiresStartup, agent }) => {
            // Disable AgentLayout for Welcome page, auth-related pages, startups pages, analytics, and privacy policy
            const authPaths = ['/', '/login', '/logout', '/signup', '/reset-password', '/no-startup', '/auth/callback', '/register/confirm'];
            const noAgentLayoutPaths = [...authPaths, '/startups', '/analytics', '/privacy-policy'];
            const shouldUseAgentLayout = path ?
              !noAgentLayoutPaths.includes(path) && !path.startsWith('/startups/') :
              true;

            return (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute
                    requiresAuth={requiresAuth}
                    requiresNotAuthenticated={requiresNotAuthenticated}
                    requiresStartup={requiresStartup}
                  >
                    {shouldUseAgentLayout ? (
                      <AgentLayout agent={agent}>
                        <Component />
                      </AgentLayout>
                    ) : (
                      <Component />
                    )}
                  </ProtectedRoute>
                }
              />
            );
          })}
      </Routes>
    </Box>
  );
}

export default Pages;
