import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  LinearProgress,
  Stack,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import {
  categoryDisplayNames,
  categoryColors,
  categoryIcons,
  CategoryEnum,
} from '@/utils/constants';
import Header from '@/sections/Header';
import ImageIcon from '@mui/icons-material/Image';
import usePatterns from '@/hooks/usePatterns';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import { useAuth } from '@/hooks/useAuth';
import type { Pattern, StartupPattern } from '@/types/strapi';
import { getPatternStatus } from '@/pages/Progress/Progress';
import { useNavigate } from 'react-router-dom';
import useRecommendedPatterns from '@/hooks/useRecommendedPatterns';

interface DashboardWidgetProps {
  startupPatterns: StartupPattern[];
  patterns: Pattern[];
}

const MaturityScoreSection: React.FC<DashboardWidgetProps> = () => {
  const { startup, updateScores } = useAuth();

  useEffect(() => {
    if (startup && !startup.scores) {
      updateScores();
    }
  }, [startup, updateScores]);

  if (!startup?.scores) return null;
  const lowestCategory = Object.entries(startup.scores).reduce((acc, [key, value]) =>
    value < acc[1] ? [key, value] : acc,
  );

  const categories = Object.values(CategoryEnum);
  const sortedScores = Object.fromEntries(
    // Get entries from the dictionary
    Object.entries(startup.scores)
      // Sort based on the index of each key in the enum values array
      .sort(([keyA], [keyB]) => {
        const indexA = categories.indexOf(keyA as CategoryEnum);
        const indexB = categories.indexOf(keyB as CategoryEnum);
        return indexA - indexB;
      }),
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Maturity Score
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            {/* Progress Bars */}
            <Stack spacing={1}>
              {Object.entries(sortedScores).map(([category, score]) => (
                <Box key={category} sx={{ position: 'relative', height: 60 }}>
                  {/* Progress Bar */}
                  <LinearProgress
                    variant="determinate"
                    value={score * 100}
                    sx={{
                      height: 40,
                      borderRadius: 8,
                      bgcolor: `${categoryColors[category as CategoryEnum]}66`,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: categoryColors[category as CategoryEnum],
                        borderRadius: 8,
                      },
                    }}
                  />
                  {/* Ticks */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '40px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    {[0, 20, 40, 60, 80, 100].map((tick) => (
                      <Box
                        key={tick}
                        sx={{
                          width: '1px',
                          height: '40px',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          visibility: [0, 100].includes(tick) ? 'hidden' : 'visible',
                        }}
                      />
                    ))}
                  </Box>
                  {/* Category Info within the Progress Bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      height: '40px',
                      padding: '0 16px',
                    }}
                  >
                    {/* Icon */}
                    <IconButton
                      size="small"
                      sx={{
                        color: categoryColors[category as CategoryEnum],
                        mr: 1,
                      }}
                    >
                      {categoryIcons[category as CategoryEnum]}
                    </IconButton>
                    {/* Category Name */}
                    <Typography variant="body1" sx={{ color: 'white', flexGrow: 1 }}>
                      {categoryDisplayNames[category as CategoryEnum]}
                    </Typography>
                    {/* Percentage */}
                    <Typography variant="body1" sx={{ color: 'white', ml: 'auto' }}>
                      {Math.round(score * 100)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Grid>
          <Grid item sm={4}>
            {/* Self-assessment */}
            <Box
              sx={{
                mt: { xs: 2, md: 0 },
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.300',
                position: 'relative',
              }}
            >
              <Chip
                label="Coming Soon"
                color="primary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: 16,
                  fontWeight: 'medium',
                }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Opportunity for Growth
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your <strong>{categoryDisplayNames[lowestCategory[0] as CategoryEnum]}</strong>{' '}
                perspective has the most room for improvement. Soon you&apos;ll be able to take a
                detailed assessment to better understand this area.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled
                sx={{
                  '&.Mui-disabled': {
                    borderColor: 'grey.300',
                    color: 'grey.500',
                  },
                }}
              >
                Self-Assessment
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const RecommendationSection: React.FC<DashboardWidgetProps> = () => {
  const navigate = useNavigate();
  const { getRecommendedPatterns, recommendedPatterns, loading, error } = useRecommendedPatterns();

  useEffect(() => {
    getRecommendedPatterns(2);
  }, [getRecommendedPatterns]);

  if (loading || !recommendedPatterns) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error loading data</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recommended Patterns
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Based on your current maturity score, we recommend the following pattern to help you
          improve.
        </Typography>
        <Grid container spacing={2}>
          {recommendedPatterns.map((pattern) => (
            <Grid item xs={6} key={pattern.documentId}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  aspectRatio: '2/3',
                  borderRadius: 4,
                }}
              >
                <Box
                  sx={{
                    bgcolor: categoryColors[pattern.category] || '#grey',
                    p: 1,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                ></Box>
                <CardMedia
                  sx={{
                    height: '30%',
                    overflow: 'hidden',
                    bgcolor: 'grey.100',
                    position: 'relative',
                    '& img': {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    },
                  }}
                >
                  {pattern.image ? (
                    <img src={`https://api.di.sce.de${pattern.image.url}`} alt={''} />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ImageIcon
                        sx={{
                          fontSize: 48,
                          color: 'grey.300',
                        }}
                      />
                    </Box>
                  )}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                      color: categoryColors[pattern.category as CategoryEnum],
                      fontWeight: 'bold',
                    }}
                  >
                    {pattern.name}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    onClick={() => navigate(`/explore/${pattern.documentId}`)}
                    variant="contained"
                    endIcon={<ArrowForward />}
                    size="small"
                    sx={{
                      bgcolor: categoryColors[pattern.category as CategoryEnum],
                      color: 'white',
                      '&:hover': {
                        bgcolor: categoryColors[pattern.category as CategoryEnum],
                      },
                    }}
                    fullWidth
                  >
                    Start Pattern
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const PatternBacklogSection: React.FC<DashboardWidgetProps> = ({ startupPatterns }) => {
  const navigate = useNavigate();
  const inProgressCount =
    startupPatterns?.filter((pattern) => getPatternStatus(pattern) === 'in_progress').length || 0;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pattern Backlog
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          You&apos;ve got some patterns in progress. Keep up the good work!
        </Typography>
        <Button
          onClick={() => navigate('/progress')}
          variant="outlined"
          endIcon={<ArrowForward />}
          sx={{ mt: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={inProgressCount} color="primary" size="small" />
            Continue Patterns
          </Box>
        </Button>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { startup } = useAuth();
  const { fetchPatterns, patterns, loading: patternsLoading, error: patternsError } = usePatterns();
  const {
    fetchStartupPatterns,
    startupPatterns,
    loading: startupPatternsLoading,
    error: startupPatternsError,
  } = useStartupPatterns();

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  useEffect(() => {
    if (startup) {
      fetchStartupPatterns(startup.documentId);
    }
  }, [fetchStartupPatterns, startup]);

  if (patternsLoading || startupPatternsLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (patternsError || startupPatternsError) {
    console.log(patternsError, startupPatternsError);
    return <Typography>Error loading data</Typography>;
  }

  if (!patterns || !startupPatterns) {
    return <Typography>No data found</Typography>;
  }

  return (
    <>
      <Header title="Dashboard" />
      <CenteredFlexBox>
        <Grid container spacing={2}>
          <Grid item sm={12}>
            <MaturityScoreSection startupPatterns={startupPatterns} patterns={patterns} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <RecommendationSection startupPatterns={startupPatterns} patterns={patterns} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <PatternBacklogSection startupPatterns={startupPatterns} patterns={patterns} />
          </Grid>
        </Grid>
      </CenteredFlexBox>
    </>
  );
};

export default Dashboard;
