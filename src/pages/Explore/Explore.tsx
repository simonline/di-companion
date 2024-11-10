import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import useRecommendedPatterns from '@/hooks/useRecommendedPatterns';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import PatternCard from '@/components/PatternCard';
import Header from '@/sections/Header';

const Explore: React.FC = () => {
  const { getRecommendedPatterns, recommendedPatterns, loading, error } = useRecommendedPatterns();

  useEffect(() => {
    getRecommendedPatterns();
  }, [getRecommendedPatterns]);

  if (loading || !recommendedPatterns) {
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

  return (
    <>
      <Header title="Explore" />
      <FullSizeCenteredFlexBox>
        <PatternCard pattern={recommendedPatterns[0]} nextUrl="/explore" />
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Explore;
