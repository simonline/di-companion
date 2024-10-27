import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

import { useAppRoutes } from '@/routes';

function Menu() {
  const { pathname } = useLocation();
  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation showLabels value={pathname}>
        {Object.values(useAppRoutes())
          .filter((route) => route.title)
          .map(({ path, title, icon }) => (
            <BottomNavigationAction
              key={path}
              value={path}
              component={Link}
              to={path as string}
              label={title}
              icon={icon && React.createElement(icon)}
            />
          ))}
      </BottomNavigation>
    </Paper>
  );
}

export default Menu;
