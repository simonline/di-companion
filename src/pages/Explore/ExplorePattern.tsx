import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import usePattern from '@/hooks/usePattern';
import PatternCard from '@/components/PatternCard';
import { useParams } from 'react-router-dom';
import Header from '@/sections/Header';
import useSearch from '@/hooks/useSearch';

const ExplorePattern: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchPattern, pattern, loading, error } = usePattern();
  const { SearchComponent } = useSearch();

  useEffect(() => {
    fetchPattern(id as string);
  }, [fetchPattern, id]);

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

  if (!pattern) {
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
      <FullSizeCenteredFlexBox>
        <PatternCard pattern={pattern} nextUrl="/explore" />
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default ExplorePattern;
