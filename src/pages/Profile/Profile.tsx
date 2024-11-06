import React from 'react';
import { Button, Grid, List, Avatar, Typography, Divider, Stack } from '@mui/material';
import { Person, Rocket } from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from './MenuItem';
import Header from '@/sections/Header';

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

  return (
    <>
      <Header title="Profile" />
      <CenteredFlexBox>
        <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80 }} alt={user.username}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6">{user.username}</Typography>
          <Typography variant="body2" color="text.secondary">
            DI user since {joinDate}
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
      </CenteredFlexBox>
    </>
  );
}

export default Profile;
