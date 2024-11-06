import { Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AppRoutes } from '@/routes/types';
import useRoutes from '..';
import { getPageHeight } from './utils';

function Pages() {
  const routes = useRoutes();
  return (
    <Box sx={{ height: (theme) => getPageHeight(theme), overflowY: 'scroll' }}>
      <Routes>
        {Object.values(routes as AppRoutes).map(({ path, component: Component }) => {
          return <Route key={path} path={path} element={<Component />} />;
        })}
      </Routes>
    </Box>
  );
}

export default Pages;
