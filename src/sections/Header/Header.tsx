import { AppBar, Box, Toolbar, Typography } from '@mui/material';

import useTheme from '@/store/theme';

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

function Header({ title, children }: HeaderProps) {
  const [theme] = useTheme();
  // const [, notificationsActions] = useNotifications();

  // function showNotification() {
  //   notificationsActions.push({
  //     options: {
  //       // Show fully customized notification
  //       // Usually, to show a notification, you'll use something like this:
  //       // notificationsActions.push({ message: ... })
  //       // `message` accepts string as well as ReactNode
  //       // If you want to show a fully customized notification, you can define
  //       // your own `variant`s, see @/sections/Notifications/Notifications.tsx
  //       variant: 'customNotification',
  //     },
  //     message: getRandomJoke(),
  //   });
  // }

  return (
    <Box sx={{ flexGrow: 1 }} data-pw={`theme-${theme}`}>
      <AppBar
        color="transparent"
        elevation={1}
        position="static"
        sx={{
          bgcolor: 'white',
          zIndex: 1000,
        }}
      >
        <Toolbar>
          {title ? (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} textAlign="center">
              {title || 'Dynamic Innovation Companion'}
            </Typography>
          ) : null}
          {children}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;
