import React from 'react';
import { Box, List, Paper } from '@mui/material';
import { User } from '@/types/strapi';
import { MenuItem } from './MenuItem';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const fieldDisplayNames: Partial<Record<keyof User, string>> = {
  email: 'Email Address',
  password: 'Password',
  givenName: 'Given Name',
  familyName: 'Family Name',
};

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <FullSizeCenteredFlexBox>
      <Paper elevation={0}>
        <Box sx={{ p: 3 }}>
          <List>
            {Object.entries(fieldDisplayNames).map(([key, label]) => {
              return (
                <MenuItem
                  key={key}
                  label={label}
                  value={key === 'password' ? '********' : String(user[key as keyof User])}
                  onClick={() => navigate(`/profile/user/${key}`)}
                />
              );
            })}
          </List>
        </Box>
      </Paper>
    </FullSizeCenteredFlexBox>
  );
};

export default UserProfile;
