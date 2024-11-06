import React, { useEffect } from 'react';
import { CircularProgress, Typography, Button, Box } from '@mui/material';
import usePatterns from '@/hooks/usePatterns';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import PatternCard from '@/components/PatternCard';
import Header from '@/sections/Header';

const Explore: React.FC = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { fetchPatterns, patterns, loading, error } = usePatterns();

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

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

  if (!patterns?.length) {
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

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % patterns.length);
  };

  return (
    <>
      <Header title="Explore" />
      <FullSizeCenteredFlexBox>
        <PatternCard pattern={patterns[currentIndex]} onNext={handleNext} />
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Explore;
