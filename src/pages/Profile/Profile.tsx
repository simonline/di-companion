import React from 'react';
import { Box, Button, Grid, List, Avatar, Typography, Divider, Stack } from '@mui/material';
import { Person, Rocket } from '@mui/icons-material';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from './MenuItem';

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
        <Grid container spacing={2} justifyContent="center" style={{ marginTop: '40px' }}>
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
    <FullSizeCenteredFlexBox>
      <Box sx={{ width: '100%' }} p={2}>
        <Stack direction="column" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80 }} alt={user.username}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6">{user.username}</Typography>
          <Typography variant="body2" color="text.secondary">
            DI user since {joinDate}
          </Typography>
        </Stack>

        <List>
          <MenuItem label="Profile" icon={<Person />} onClick={() => navigate('/profile/user')} />

          <Divider />

          {user.startups &&
            user.startups.map((startup) => (
              <MenuItem
                key={startup.id}
                label={startup.name}
                icon={<Rocket />}
                onClick={() => navigate(`/profile/startup/${startup.documentId}`)}
              />
            ))}
        </List>
      </Box>
    </FullSizeCenteredFlexBox>
  );
}

export default Profile;
