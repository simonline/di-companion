import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AppRoutes } from '@/routes/types';
import useRoutes from '..';
import { getPageHeight } from './utils';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthContext } from '@/hooks/useAuth';
import { AgentLayout } from '@/components/AgentLayout';

function Pages() {
  const routes = useRoutes();
  const { profile } = useAuthContext();
  const isCoach = profile?.is_coach || false;

  return (
    <Box sx={{
      height: 'calc(100vh - 80px)',
      overflowY: 'hidden',
      position: 'relative'
    }}>
      <Routes>
        {Object.values(routes as AppRoutes)
          .filter((route) => route.visibleTo.includes(isCoach ? 'coach' : 'startup'))
          .map(({ path, component: Component, requiresAuth, requiresStartup, agent }) => {
            // Disable AgentLayout for Welcome page and all auth-related pages
            const authPaths = ['/', '/login', '/logout', '/signup', '/reset-password', '/no-startup', '/auth/callback'];
            const shouldUseAgentLayout = path ? !authPaths.includes(path) : true;
            
            return (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requiresAuth={requiresAuth} requiresStartup={requiresStartup}>
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
