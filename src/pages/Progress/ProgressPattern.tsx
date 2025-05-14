import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import usePattern from '@/hooks/usePattern';
import PatternCard from '@/components/PatternCard';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';

const Progress: React.FC = () => {
  const { id: patternId } = useParams<{ id: string }>();
  const { fetchPattern, pattern, loading, error } = usePattern();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPattern(patternId as string);
  }, [fetchPattern, patternId]);

  const handlePatternComplete = () => {
    navigate('/progress');
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

  if (!fetchPattern) {
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
        {pattern && (
          <PatternCard
            pattern={pattern}
            onComplete={handlePatternComplete}
            nextUrl="/progress"
          />
        )}
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Progress;
