import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Avatar, 
  Typography, 
  Stack, 
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Person, 
  Email, 
  Edit, 
  Logout,
  Security,
  NotificationsActive,
  DarkMode,
  Language
} from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';
import { getAvatarUrl } from '@/lib/strapi';

function Settings() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const avatarUrl = getAvatarUrl(user.avatar?.formats?.thumbnail?.url);
  const userInitials = `${user.givenName?.charAt(0) || ''}${user.familyName?.charAt(0) || ''}`;
  
  const joinDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <Header title="Settings" />
      <CenteredFlexBox>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    src={avatarUrl}
                    sx={{ width: 80, height: 80 }}
                    alt={`${user.givenName} ${user.familyName}`}
                  >
                    {userInitials || user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="600">
                      {user.givenName} {user.familyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{user.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Member since {joinDate}
                    </Typography>
                  </Box>
                  <IconButton 
                    onClick={() => navigate('/profile/edit')}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Account Settings
                </Typography>
                <List>
                  <ListItemButton onClick={() => navigate('/profile/edit')}>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Edit Profile"
                      secondary="Update your personal information"
                    />
                  </ListItemButton>
                  <ListItemButton onClick={() => navigate('/profile/edit/password')}>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Change Password"
                      secondary="Update your security credentials"
                    />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email Preferences"
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
                    <Switch />
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