import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import useStartupPattern from '@/hooks/useStartupPattern';
import PatternCard from '@/components/PatternCard';
import { useParams } from 'react-router-dom';
import Header from '@/sections/Header';

const Progress: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchStartupPattern, startupPattern, loading, error } = useStartupPattern();

  useEffect(() => {
    fetchStartupPattern(id as string);
  }, [fetchStartupPattern, id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 4,
        }}
      >
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error loading patterns
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!startupPattern) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 4,
        }}
      >
        <Typography variant="h6">Pattern not found</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title="Progress" />
      <FullSizeCenteredFlexBox>
        <PatternCard pattern={startupPattern.pattern} nextUrl="/progress" />
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Progress;
