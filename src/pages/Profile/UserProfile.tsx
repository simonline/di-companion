import React from 'react';
import { List } from '@mui/material';
import { User } from '@/types/strapi';
import { MenuItem } from './MenuItem';
import { CenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';

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
    <>
      <Header title="User Profile" />
      <CenteredFlexBox>
        <List sx={{ width: '100%' }}>
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
      </CenteredFlexBox>
    </>
  );
};

export default UserProfile;
