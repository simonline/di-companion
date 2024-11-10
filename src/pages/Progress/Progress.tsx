import React, { useEffect, useState } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
  Badge,
} from '@mui/material';
import {
  Pattern as PatternIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { CenteredFlexBox } from '@/components/styled';
import { StartupPattern, ResponseTypeEnum, ResponseEnum } from '@/types/strapi';
import { categoryColors, categoryDisplayNames, phaseDisplayNames } from '@/utils/constants';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/sections/Header';
import { useAuth } from '@/hooks/useAuth';

type FilterStatus = 'in_progress' | 'completed';

export const getPatternStatus = (pattern: StartupPattern): FilterStatus | null => {
  if (pattern.completedAt) {
    return 'completed';
  } else if (
    pattern.responseType === ResponseTypeEnum.accept ||
    pattern.response === ResponseEnum.maybe_later
  ) {
    return 'in_progress';
  } else {
    return null;
  }
};

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
        <Stack spacing={1}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
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
            {getPatternStatus(startupPattern) === 'completed' && (
              <Chip
                icon={<CheckIcon />}
                label="Completed"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Last updated: {format(new Date(startupPattern.updatedAt), 'MMM dd, yyyy')}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Stack direction="row" spacing={0.5}>
              <Chip
                key={pattern.category}
                label={categoryDisplayNames[pattern.category]}
                size="small"
                sx={{
                  bgcolor: categoryColors[pattern.category],
                  color: 'white',
                }}
              />
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
  const { state } = useLocation();
  const { startup } = useAuth();
  const { fetchStartupPatterns, startupPatterns, loading, error } = useStartupPatterns();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('in_progress');

  useEffect(() => {
    if (startup) {
      fetchStartupPatterns(startup.documentId);
    }
  }, [fetchStartupPatterns, startup]);

  const filteredPatterns = startupPatterns?.filter(
    (pattern) => getPatternStatus(pattern) === filterStatus,
  );

  const inProgressCount =
    startupPatterns?.filter((pattern) => getPatternStatus(pattern) === 'in_progress').length || 0;
  const completedCount =
    startupPatterns?.filter((pattern) => getPatternStatus(pattern) === 'completed').length || 0;

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
        <ToggleButtonGroup
          value={filterStatus}
          exclusive
          onChange={(_, newValue) => {
            if (newValue !== null) {
              setFilterStatus(newValue);
            }
          }}
          aria-label="pattern status filter"
          sx={{ width: '100%', mb: 3 }}
        >
          <ToggleButton value="in_progress" aria-label="in progress patterns" sx={{ flex: 1 }}>
            <Badge badgeContent={inProgressCount} color="primary" sx={{ mr: 1 }}>
              <PendingIcon sx={{ mr: 1 }} />
            </Badge>
            In Progress
          </ToggleButton>
          <ToggleButton value="completed" aria-label="completed patterns" sx={{ flex: 1 }}>
            <Badge badgeContent={completedCount} color="success" sx={{ mr: 1 }}>
              <CheckIcon sx={{ mr: 1 }} />
            </Badge>
            Completed
          </ToggleButton>
        </ToggleButtonGroup>
        <List sx={{ width: '100%' }}>
          {filteredPatterns?.map((startupPattern) => (
            <ListItem
              key={startupPattern.documentId}
              onClick={() => navigate(state?.nextUrl || `/progress/${startupPattern.documentId}`)}
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
