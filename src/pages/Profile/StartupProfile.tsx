import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { List, Divider, Typography } from '@mui/material';
import { MenuItem } from './MenuItem';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import EditIcon from '@mui/icons-material/Edit';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useAuthContext } from '@/hooks/useAuth';

const StartupProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Find the current startup to show its name
  const startup = user?.startups?.find((s) => s.documentId === id);

  return (
    <>
      <Header title="Startup Profile" />
      <CenteredFlexBox>
        <Typography variant="h5" sx={{ my: 2 }}>
          {startup?.name || 'Your Startup'}
        </Typography>

        <List sx={{ width: '100%' }}>
          <MenuItem
            label="Edit Startup Information"
            icon={<EditIcon />}
            onClick={() => navigate(`/profile/startup/${id}/edit`)}
          />
          <Divider sx={{ my: 2 }} />
          <MenuItem
            label="Manage Team"
            icon={<GroupAddIcon />}
            onClick={() => navigate(`/profile/startup/${id}/team`)}
          />
        </List>
      </CenteredFlexBox>
    </>
  );
};

export default StartupProfile;
