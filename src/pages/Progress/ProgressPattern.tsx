import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import PatternCard from '@/components/PatternCard';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/sections/Header';

const Progress: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchStartupPatterns, startupPatterns, loading, error } = useStartupPatterns();

  useEffect(() => {
    fetchStartupPatterns();
  }, [fetchStartupPatterns]);

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

  if (!startupPatterns?.length) {
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
        <Typography variant="h6">No patterns available</Typography>
      </Box>
    );
  }

  const startupPattern = startupPatterns?.find(
    (startupPattern) => startupPattern.documentId === id,
  );
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
        <PatternCard pattern={startupPattern.pattern} onNext={() => navigate('/progress')} />
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Progress;
