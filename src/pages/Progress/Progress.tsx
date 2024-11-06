import React, { useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  Chip,
  Typography,
  Box,
  Avatar,
  Stack,
} from '@mui/material';
import { Pattern as PatternIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { CenteredFlexBox } from '@/components/styled';
import { StartupPattern } from '@/types/strapi';
import { categoryColors, categoryDisplayNames, phaseDisplayNames } from '@/utils/constants';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';

const PatternListItem: React.FC<{ startupPattern: StartupPattern }> = ({ startupPattern }) => {
  const { pattern } = startupPattern;
  return (
    <Card
      sx={{
        mb: 2,
        width: '100%',
        borderRadius: 4,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {' '}
        {/* reduced padding */}
        <Stack spacing={1}>
          {/* Header with Icon and Name */}
          <Stack direction="row" spacing={2} alignItems="center">
            {pattern.image ? (
              <Avatar src={`https://api.di.sce.de/${pattern.image.url}`} />
            ) : (
              <Avatar>
                <PatternIcon />
              </Avatar>
            )}
            <Typography variant="h6" component="div">
              {pattern.name}
            </Typography>
          </Stack>

          {/* Last Updated */}
          <Typography variant="body2" color="text.secondary">
            Last updated: {format(new Date(startupPattern.updatedAt), 'MMM dd, yyyy')}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Stack direction="row" spacing={0.5}>
              {pattern.categories.map((category) => (
                <Chip
                  key={category}
                  label={categoryDisplayNames[category]}
                  size="small"
                  sx={{
                    bgcolor: categoryColors[category],
                    color: 'white',
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Stack direction="row" spacing={0.5}>
              {pattern.phases.map((phase) => (
                <Chip
                  key={phase}
                  label={phaseDisplayNames[phase]}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const Progress: React.FC = () => {
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

  return (
    <>
      <Header title="Progress" />
      <CenteredFlexBox>
        <List sx={{ width: '100%' }}>
          {startupPatterns.map((startupPattern) => (
            <ListItem
              key={startupPattern.documentId}
              onClick={() => navigate(`/progress/${startupPattern.documentId}`)}
              sx={{ cursor: 'pointer', padding: 0 }}
            >
              <PatternListItem startupPattern={startupPattern} />
            </ListItem>
          ))}
        </List>
      </CenteredFlexBox>
    </>
  );
};

export default Progress;
