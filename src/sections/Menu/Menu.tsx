import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import routes from '@/routes';

function Menu() {
  const { pathname } = useLocation();
  return (
    <BottomNavigation showLabels value={pathname}>
      {Object.values(routes)
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
  );
}

export default Menu;
