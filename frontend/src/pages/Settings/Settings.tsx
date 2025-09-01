import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Switch
} from '@mui/material';
import {
  Person,
  Email,
  Logout,
  NotificationsActive,
  DarkMode,
  Language,
  Policy,
} from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';
import useTheme from '@/store/theme';
import { Themes } from '@/theme/types';

function Settings() {
  const { user, profile, logout } = useAuthContext();
  const navigate = useNavigate();
  const [themeMode, themeActions] = useTheme();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleThemeToggle = () => {
    themeActions.toggle();
  };

  return (
    <>
      <Header title="Settings" />
      <CenteredFlexBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Account Settings
                </Typography>
                <List>
                  <ListItemButton onClick={() => navigate('/profile/edit?from=settings')}>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Name"
                      secondary={`${profile?.given_name || ''} ${profile?.family_name || ''}`.trim() || 'Not set'}
                    />
                  </ListItemButton>
                  <ListItemButton onClick={() => navigate('/profile/edit?from=settings')}>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Preferences
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsActive />
                    </ListItemIcon>
                    <ListItemText primary="Push Notifications" />
                    <Switch defaultChecked />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DarkMode />
                    </ListItemIcon>
                    <ListItemText primary="Dark Mode" />
                    <Switch 
                      checked={themeMode === Themes.DARK}
                      onChange={handleThemeToggle}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Language />
                    </ListItemIcon>
                    <ListItemText primary="Language" secondary="English" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Legal & Privacy
                </Typography>
                <List>
                  <ListItemButton onClick={() => navigate('/privacy-policy')}>
                    <ListItemIcon>
                      <Policy />
                    </ListItemIcon>
                    <ListItemText
                      primary="Privacy Policy"
                      secondary="View our privacy policy and data handling practices"
                    />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Account Actions
                </Typography>
                <List>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      secondary="Sign out of your account"
                      primaryTypographyProps={{ color: 'error' }}
                    />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CenteredFlexBox>
    </>
  );
}

export default Settings;