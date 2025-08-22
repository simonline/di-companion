import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Tooltip,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';

import { useAppRoutes } from '@/routes';
import { useAuthContext } from '@/hooks/useAuth';
import { useChatContext } from '@/components/Chat/ChatContext';

function Menu() {
  const { pathname } = useLocation();
  const { user } = useAuthContext();
  const { isMobileKeyboardVisible } = useChatContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCoach = user?.isCoach || false;
  const userType = isCoach ? 'coach' : 'startup';
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // Hide menu on mobile when keyboard is visible
  if (isMobile && isMobileKeyboardVisible) {
    return null;
  }


  return (
    <>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation
          showLabels={false}
          value={pathname}
          sx={{
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 8px',
            },
          }}
        >
          {Object.values(useAppRoutes())
            .filter(
              (route) => route.title && (!route.visibleTo || route.visibleTo.includes(userType)),
            )
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(({ path, title, icon, iconOutlined }) => {
              const isActive = pathname === path;
              const isHovered = hoveredPath === path;
              const IconComponent = (isActive || isHovered) ? icon : (iconOutlined || icon);

              if (path === '/add') {
                return (
                  <Tooltip key={path} title={title} placement="top" arrow>
                    <BottomNavigationAction
                      value={path}
                      component={Link}
                      to={path as string}
                      icon={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                          }}
                        >
                          {IconComponent && React.createElement(IconComponent, {
                            sx: {
                              fontSize: '2rem',
                              color: 'white'
                            }
                          })}
                        </Box>
                      }
                      onMouseEnter={() => path && setHoveredPath(path)}
                      onMouseLeave={() => setHoveredPath(null)}
                      sx={{
                        '& .MuiBottomNavigationAction-label': {
                          display: 'none',
                        },
                      }}
                    />
                  </Tooltip>
                );
              }
              return (
                <Tooltip key={path} title={title} placement="top" arrow>
                  <BottomNavigationAction
                    value={path}
                    component={Link}
                    to={path as string}
                    icon={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: 'transparent',
                          color: isActive || isHovered ? 'primary.main' : 'text.secondary',
                          transition: 'background-color 0.2s',
                        }}
                      >
                        {IconComponent && React.createElement(IconComponent, { sx: { fontSize: '1.8rem' } })}
                      </Box>
                    }
                    onMouseEnter={() => path && setHoveredPath(path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    sx={{
                      '& .MuiBottomNavigationAction-label': {
                        display: 'none',
                      },
                    }}
                  />
                </Tooltip>
              );
            })}
        </BottomNavigation>
      </Paper>
    </>
  );
}

export default Menu;
