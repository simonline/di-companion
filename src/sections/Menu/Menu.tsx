import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';

import { useAppRoutes } from '@/routes';
import { useAuthContext } from '@/hooks/useAuth';

function Menu() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const isCoach = user?.isCoach || false;
  const userType = isCoach ? 'coach' : 'startup';

  // Handle bug report navigation action click
  const handleBugReportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default navigation behavior
    event.preventDefault();

    // Dispatch a custom event that BugReportButton can listen for
    const bugReportEvent = new CustomEvent('open-bug-report');
    document.dispatchEvent(bugReportEvent);
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation showLabels value={pathname}>
        {Object.values(useAppRoutes())
          .filter(
            (route) => route.title && (!route.visibleTo || route.visibleTo.includes(userType)),
          )
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
