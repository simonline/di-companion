import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import useTheme from '@/store/theme';

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

function Header({ title, children }: HeaderProps) {
  const [theme] = useTheme();

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
