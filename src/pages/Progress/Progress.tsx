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
  Paper,
} from '@mui/material';
import {
  Pattern as PatternIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
  QuestionMark as QuestionMarkIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { CenteredFlexBox } from '@/components/styled';
import { StartupPattern, ResponseTypeEnum } from '@/types/strapi';
import { categoryColors, categoryDisplayNames, phaseNumbers, PhaseEnum } from '@/utils/constants';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';

type FilterStatus = 'in_progress' | 'applied' | 'not_applied';

export const getPatternStatus = (pattern: StartupPattern): FilterStatus | null => {
  if (pattern.appliedAt) {
    return 'applied';
  } else if (pattern.responseType === ResponseTypeEnum.accept) {
    return 'in_progress';
  } else {
    return 'not_applied';
  }
};

const PatternListItem: React.FC<{ startupPattern: StartupPattern }> = ({ startupPattern }) => {
  const { pattern } = startupPattern;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      sx={{
        mb: 2,
        width: '100%',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? 8 : 1,
        position: 'relative',
        overflow: 'visible',
        '&:after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: categoryColors[pattern.category],
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: `${categoryColors[pattern.category]}22`,
                  color: categoryColors[pattern.category],
                }}
              >
                {pattern.image ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${pattern.image.url}`}
                    alt={pattern.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <PatternIcon sx={{ fontSize: 28 }} />
                )}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 900,
                    mb: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {pattern.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated {format(new Date(startupPattern.updatedAt), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={categoryDisplayNames[pattern.category]}
              size="small"
              sx={{
                bgcolor: `${categoryColors[pattern.category]}`,
                color: 'white',
                fontWeight: 700,
                '&:hover': { bgcolor: `${categoryColors[pattern.category]}22` },
                height: 24,
              }}
            />
            {Object.entries(phaseNumbers).map(([phase, number]) => (
              <Chip
                key={number}
                label={number}
                sx={{
                  backgroundColor: pattern.phases.includes(phase as PhaseEnum)
                    ? '#918d73'
                    : '#cccdcc',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '.9em',
                  borderRadius: '50%',
                  height: '1.5em',
                  width: '1.5em',
                  padding: 0,
                  span: {
                    padding: 0,
                  },
                }}
              />
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { startup } = useAuthContext();
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
  const appliedCount =
    startupPatterns?.filter((pattern) => getPatternStatus(pattern) === 'applied').length || 0;
  const notAppliedCount =
    startupPatterns?.filter((pattern) => getPatternStatus(pattern) === 'not_applied').length || 0;

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        p={4}
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
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh" p={4}>
        <Typography variant="h6">No patterns available</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title="Progress" />
      <CenteredFlexBox>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            width: '100%',
            bgcolor: 'background.default',
            borderRadius: 2,
          }}
        >
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setFilterStatus(newValue);
              }
            }}
            aria-label="pattern status filter"
            sx={{
              width: '100%',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              },
            }}
          >
            <ToggleButton value="in_progress" aria-label="in progress patterns" sx={{ flex: 1 }}>
              <Badge
                badgeContent={inProgressCount}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: 'white',
                    color: 'primary.main',
                  },
                }}
              >
                <PendingIcon sx={{ mr: 1 }} />
                In Progress
              </Badge>
            </ToggleButton>
            <ToggleButton value="applied" aria-label="applied patterns" sx={{ flex: 1 }}>
              <Badge
                badgeContent={appliedCount}
                color="success"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: 'white',
                    color: 'success.main',
                  },
                }}
              >
                <CheckIcon sx={{ mr: 1 }} />
                Applied
              </Badge>
            </ToggleButton>
            <ToggleButton value="not_applied" aria-label="not applied patterns" sx={{ flex: 1 }}>
              <Badge
                badgeContent={notAppliedCount}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: 'white',
                    color: 'success.main',
                  },
                }}
              >
                <QuestionMarkIcon sx={{ mr: 1 }} />
                Not Applied
              </Badge>
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        <List sx={{ width: '100%', px: 2 }}>
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
