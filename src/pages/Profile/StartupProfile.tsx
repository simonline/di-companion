import React from 'react';
import { useParams } from 'react-router-dom';
import { List } from '@mui/material';
import { MenuItem } from './MenuItem';
import { CenteredFlexBox } from '@/components/styled';
import { steps } from '@/pages/Startups/types';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';

interface StartupProfileProps {
  id: string;
}

const StartupProfile: React.FC<StartupProfileProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <Header title="Startup Profile" />
      <CenteredFlexBox>
        <List sx={{ width: '100%' }}>
          {steps.map((label, index) => (
            <MenuItem
              key={index}
              label={label}
              value="-"
              onClick={() => navigate(`/profile/startup/${id}/${index}`)}
            />
          ))}
        </List>
      </CenteredFlexBox>
    </>
  );
};

export default StartupProfile;
