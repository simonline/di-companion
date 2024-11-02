import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, List, Paper } from '@mui/material';
import { MenuItem } from './MenuItem';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { steps } from '@/pages/Startups/types';
import { useNavigate } from 'react-router-dom';

interface StartupProfileProps {
  id: string;
}

const StartupProfile: React.FC<StartupProfileProps> = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <FullSizeCenteredFlexBox>
      <Paper elevation={0}>
        <Box sx={{ p: 3 }}>
          <List>
            {steps.map((label, index) => (
              <MenuItem
                key={index}
                label={label}
                value="-"
                onClick={() => navigate(`/profile/startup/${id}/${index}`)}
              />
            ))}
          </List>
        </Box>
      </Paper>
    </FullSizeCenteredFlexBox>
  );
};

export default StartupProfile;
