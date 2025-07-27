import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AppRoutes } from '@/routes/types';
import useRoutes from '..';
import { getPageHeight } from './utils';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthContext } from '@/hooks/useAuth';
import { AgentLayout } from '@/components/AgentLayout';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

function Pages() {
  const routes = useRoutes();
  const { user } = useAuthContext();
  const isCoach = user?.isCoach || false;
  const { flags } = useFeatureFlags();

  return (
    <Box sx={{
      height: flags.agent ? 'calc(100vh - 80px)' : (theme) => getPageHeight(theme),
      overflowY: flags.agent ? 'hidden' : 'scroll',
      position: flags.agent ? 'relative' : 'static'
    }}>
      <Routes>
        {Object.values(routes as AppRoutes)
          .filter((route) => route.visibleTo.includes(isCoach ? 'coach' : 'startup'))
          .map(({ path, component: Component, requiresAuth, requiresStartup }) => {
            return (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requiresAuth={requiresAuth} requiresStartup={requiresStartup}>
                    {flags.agent ? (
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
