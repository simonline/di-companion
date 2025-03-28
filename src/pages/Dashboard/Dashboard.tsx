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
  Paper,
  Tooltip,
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
import { useAuthContext } from '@/hooks/useAuth';
import type { Pattern, StartupPattern } from '@/types/strapi';
import { getPatternStatus } from '@/pages/Progress/Progress';
import { useNavigate } from 'react-router-dom';
import useRecommendedPatterns from '@/hooks/useRecommendedPatterns';
import InfoIcon from '@mui/icons-material/Info';
import Loading from '@/components/Loading';

interface DashboardWidgetProps {
  startupPatterns: StartupPattern[];
  patterns: Pattern[];
}

const MaturityScoreSection: React.FC<DashboardWidgetProps> = () => {
  const { startup, updateScores } = useAuthContext();
  const navigate = useNavigate();

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

  // Calculate overall maturity score (average of all categories)
  const overallScore =
    Object.values(startup.scores).reduce((sum, score) => sum + score, 0) /
    Object.values(startup.scores).length;
  const overallScorePercentage = Math.round(overallScore * 100);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="700" gutterBottom>
            Your Maturity Score
          </Typography>
          <Tooltip title="Your maturity score is calculated based on the patterns you've applied and your self-assessment results. It represents your startup's progress across different perspectives.">
            <InfoIcon color="action" fontSize="small" />
          </Tooltip>
        </Box>

        {/* Overall Score Display */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'background.default',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Overall Maturity Score
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Your startup&apos;s overall maturity across all perspectives
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: `conic-gradient(#4CAF50 ${overallScorePercentage}%, #e0e0e0 0)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'white',
                  },
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {overallScorePercentage}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

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
                    <img src={categoryIcons[category as CategoryEnum]} alt={''} height={24} />
                    {/* Category Name */}
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'white',
                        flexGrow: 1,
                        marginLeft: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
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
            {/* New section below Opportunity for Growth */}
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.light',
                bgcolor: 'primary.lighter',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="medium"
                onClick={() => window.open('https://startforfuture.eu/page/dashboard', '_blank')}
                sx={{
                  borderRadius: 4,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 2,
                }}
              >
                Visit SFF Community
              </Button>
            </Box>
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
                label="New"
                color="primary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: 16,
                  fontWeight: 'medium',
                }}
              />

              <Typography
                variant="subtitle2"
                fontWeight="700"
                sx={{ mb: 1, color: 'text.secondary' }}
              >
                Opportunity for Growth
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your <strong>{categoryDisplayNames[lowestCategory[0] as CategoryEnum]}</strong>{' '}
                perspective has the most room for improvement. Take our detailed assessment to
                better understand your startup&apos;s maturity.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/self-assessment')}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
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
        <Typography variant="h6" fontWeight="700" gutterBottom>
          Recommended Patterns
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Based on your current maturity score, we recommend the following pattern to help you
          improve.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {recommendedPatterns.map((pattern) => (
            <Box key={pattern.documentId} sx={{ flex: '1 1 calc(50% - 8px)' }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: categoryColors[pattern.category] || '#grey',
                    height: 20,
                    p: 1,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                />
                <CardMedia
                  sx={{
                    height: '30%',
                    minHeight: '80px',
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
                    <img
                      src={`${import.meta.env.VITE_API_URL}${pattern.image.url}`}
                      alt={pattern.name}
                    />
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
                      <ImageIcon sx={{ fontSize: 48, color: 'grey.300' }} />
                    </Box>
                  )}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: categoryColors[pattern.category],
                      fontWeight: 'bold',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: 48,
                      mb: 1,
                    }}
                  >
                    {pattern.name}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, mt: 'auto' }}>
                  <Button
                    onClick={() => navigate(`/explore/${pattern.documentId}`)}
                    variant="contained"
                    endIcon={<ArrowForward />}
                    fullWidth
                    sx={{
                      bgcolor: categoryColors[pattern.category],
                      color: 'white',
                      '&:hover': {
                        bgcolor: categoryColors[pattern.category],
                      },
                    }}
                  >
                    Start Pattern
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
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
        <Typography variant="h6" fontWeight="700" gutterBottom>
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
  const { startup } = useAuthContext();
  const { fetchPatterns, patterns, error: patternsError } = usePatterns();
  const {
    fetchStartupPatterns,
    startupPatterns,
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

  if (patternsError || startupPatternsError) {
    console.log(patternsError, startupPatternsError);
    return <Typography>Error loading data</Typography>;
  }

  return (
    <>
      <Header title="Dashboard" />
      <CenteredFlexBox>
        {patterns && startupPatterns ? (
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
        ) : (
          <Loading />
        )}
      </CenteredFlexBox>
    </>
  );
};

export default Dashboard;
