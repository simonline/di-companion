import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';

interface ProfileFieldProps {
  label: string;
  value: string | number | boolean;
  onEdit: () => void;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => (
  <Container maxWidth="sm">
    <Paper elevation={0}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {label}
        </Typography>
        <Typography variant="body1">
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
        </Typography>
      </Box>
    </Paper>
  </Container>
);

export default ProfileField;
