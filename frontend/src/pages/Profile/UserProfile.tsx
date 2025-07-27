import React from 'react';
import { useAuthContext } from '@/hooks/useAuth';
import UpdateProfile from './UpdateProfile';

const UserProfile: React.FC = () => {
  const { user } = useAuthContext();

  if (!user) return null;

  // Display the update form directly
  return <UpdateProfile />;
};

export default UserProfile;
