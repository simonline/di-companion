import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography, Box, Container } from '@mui/material';
import useRecommendedPatterns from '@/hooks/useRecommendedPatterns';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import PatternCard from '@/components/PatternCard';
import Header from '@/sections/Header';
import useSearch from '@/hooks/useSearch';

const Explore: React.FC = () => {
  const { getRecommendedPatterns, recommendedPatterns, loading, error } = useRecommendedPatterns();
  const { SearchComponent } = useSearch();

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
      <Header>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 'lg',
            mx: 'auto',
            px: 2,
          }}
        >
          <Box sx={{ width: '100px', flexGrow: 0 }} /> {/* Left spacer */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Explore
          </Typography>
          <Box sx={{ flexGrow: 0, width: 'auto' }}>
            {' '}
            {/* Right side for search */}
            <SearchComponent />
          </Box>
        </Box>
      </Header>
      <Container maxWidth="lg">
        <FullSizeCenteredFlexBox>
          <PatternCard pattern={recommendedPatterns[0]} nextUrl="/explore" />
        </FullSizeCenteredFlexBox>
      </Container>
    </>
  );
};

export default Explore;
