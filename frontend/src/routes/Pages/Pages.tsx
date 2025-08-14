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
  const { user } = useAuthContext();
  const isCoach = user?.isCoach || false;

  return (
    <Box sx={{
      height: 'calc(100vh - 80px)',
      overflowY: 'hidden',
      position: 'relative'
    }}>
      <Routes>
        {Object.values(routes as AppRoutes)
          .filter((route) => route.visibleTo.includes(isCoach ? 'coach' : 'startup'))
          .map(({ path, component: Component, requiresAuth, requiresStartup }) => {
            // Disable AgentLayout for the Welcome page (start page)
            const shouldUseAgentLayout = path !== '/';
            
            return (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requiresAuth={requiresAuth} requiresStartup={requiresStartup}>
                    {shouldUseAgentLayout ? (
                      <AgentLayout>
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
