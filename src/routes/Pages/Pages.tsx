import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AppRoutes } from '@/routes/types';
import useRoutes from '..';
import { getPageHeight } from './utils';
import ProtectedRoute from '../ProtectedRoute';

function Pages() {
  const routes = useRoutes();
  return (
    <Box sx={{ height: (theme) => getPageHeight(theme), overflowY: 'scroll' }}>
      <Routes>
        {Object.values(routes as AppRoutes).map(
          ({ path, component: Component, requiresAuth, requiresStartup }) => {
            return (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requiresAuth={requiresAuth} requiresStartup={requiresStartup}>
                    <Component />
                  </ProtectedRoute>
                }
              />
            );
          },
        )}
      </Routes>
    </Box>
  );
}

export default Pages;
