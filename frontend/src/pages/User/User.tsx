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
  Divider
} from '@mui/material';
import { 
  Person, 
  Email, 
  Edit, 
  Logout,
  Security,
  NotificationsActive
} from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';
import { getAvatarUrl } from '@/lib/strapi';

function User() {
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
      <Header title="User Profile" />
      <CenteredFlexBox>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    src={avatarUrl}
                    sx={{ width: 100, height: 100 }}
                    alt={`${user.givenName} ${user.familyName}`}
                  >
                    {userInitials || user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight="700">
                      {user.givenName} {user.familyName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      @{user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                  Account Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Full Name"
                      secondary={`${user.givenName} ${user.familyName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Quick Actions
                </Typography>
                <List>
                  <ListItemButton onClick={() => navigate('/profile/edit')}>
                    <ListItemIcon>
                      <Edit />
                    </ListItemIcon>
                    <ListItemText primary="Edit Profile" />
                  </ListItemButton>
                  <ListItemButton onClick={() => navigate('/profile/edit/password')}>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText primary="Change Password" />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemIcon>
                      <NotificationsActive />
                    </ListItemIcon>
                    <ListItemText primary="Notification Settings" />
                  </ListItemButton>
                  <Divider />
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Logout" 
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

export default User;