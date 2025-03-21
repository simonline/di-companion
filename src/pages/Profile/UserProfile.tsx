import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UpdateProfile from './UpdateProfile';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Display the update form directly
  return <UpdateProfile />;
};

export default UserProfile;
