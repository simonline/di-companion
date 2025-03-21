import React from 'react';
import { Button, Grid, List, Avatar, Typography, Divider, Stack } from '@mui/material';
import { Person, Rocket } from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from './MenuItem';
import Header from '@/sections/Header';
import { getAvatarUrl } from '@/lib/strapi';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const joinDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (!user) {
    return (
      <>
        {/* Signup and Login Buttons */}
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained" color="primary" size="large" href="/signup">
              Sign Up
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" size="large" href="/login">
              Login
            </Button>
          </Grid>
        </Grid>
      </>
    );
  }

  // Get avatar URL if available
  const avatarUrl = getAvatarUrl(user.avatar?.formats?.thumbnail?.url);

  // Get user's initials for avatar fallback
  const userInitials = `${user.givenName?.charAt(0) || ''}${user.familyName?.charAt(0) || ''}`;

  return (
    <>
      <Header title="Profile" />
      <CenteredFlexBox>
        <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar
            src={avatarUrl}
            sx={{ width: 80, height: 80 }}
            alt={`${user.givenName} ${user.familyName}`}
          >
            {userInitials || user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography fontWeight="700" variant="h6">
            {user.givenName} {user.familyName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            since {joinDate}
          </Typography>
        </Stack>

        <List sx={{ width: '100%' }}>
          <MenuItem label="Profile" icon={<Person />} onClick={() => navigate('/profile/user')} />

          <Divider />

          {user.startups &&
            user.startups.map((startup) => (
              <MenuItem
                key={startup.documentId}
                label={startup.name}
                icon={<Rocket />}
                onClick={() => navigate(`/profile/startup/${startup.documentId}`)}
              />
            ))}
        </List>

        <Stack sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/logout')}>
            Logout
          </Button>
        </Stack>
      </CenteredFlexBox>
    </>
  );
}

export default Profile;
