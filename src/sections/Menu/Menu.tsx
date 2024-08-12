import React from 'react';
import { Link } from 'react-router-dom';

import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import routes from '@/routes';

function Menu() {
  return (
    <BottomNavigation showLabels>
      {Object.values(routes)
        .filter((route) => route.title)
        .map(({ path, title, icon }) => (
          <BottomNavigationAction
            key={path}
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
