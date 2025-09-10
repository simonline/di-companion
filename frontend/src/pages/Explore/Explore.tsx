import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import useRecommendedPatterns, { CategoryFilter } from '@/hooks/useRecommendedPatterns';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import PatternCard from '@/components/PatternCard';
import Header from '@/sections/Header';
import useSearch from '@/hooks/useSearch';
import { useCurrentPattern } from '@/hooks/useCurrentPattern';

const Explore: React.FC = () => {
  // Extract category from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const category = (urlParams.get('category') || 'exclude-entrepreneur') as CategoryFilter;
  const { getRecommendedPatterns, recommendedPatterns, loading, error } = useRecommendedPatterns(category);
  const { SearchComponent } = useSearch();
  const { setCurrentPattern } = useCurrentPattern();

  useEffect(() => {
    getRecommendedPatterns();
  }, [getRecommendedPatterns]);

  // Set the current pattern when recommended patterns are loaded
  useEffect(() => {
    if (recommendedPatterns && recommendedPatterns.length > 0) {
      setCurrentPattern(recommendedPatterns[0]);
    } else {
      setCurrentPattern(null);
    }
  }, [recommendedPatterns, setCurrentPattern]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setCurrentPattern(null);
    };
  }, [setCurrentPattern]);

  const handlePatternComplete = () => {
    getRecommendedPatterns()
  };

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

  if (!recommendedPatterns || recommendedPatterns.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          You've completed all recommended patterns for now.<br />
          Check back later for more recommendations.
        </Typography>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <SearchComponent />
      </Box>
      <FullSizeCenteredFlexBox>
        <PatternCard
          pattern={recommendedPatterns[0]}
          onComplete={handlePatternComplete}
          nextUrl="/explore"
        />
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Explore;
