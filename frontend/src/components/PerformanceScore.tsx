import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Stack,
  Button,
  Paper,
  Tooltip,
  IconButton,
  CardMedia,
} from '@mui/material';
import { Refresh, ArrowForward, Image as ImageIcon } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import {
  categoryDisplayNames,
  categoryColors,
  categoryIcons,
  CategoryEnum,
} from '@/utils/constants';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import useRecommendedPatterns from '@/hooks/useRecommendedPatterns';

const PerformanceScore: React.FC = () => {
  const { startup, updateScores } = useAuthContext();
  const navigate = useNavigate();
  const { getRecommendedPatterns, recommendedPatterns, loading } = useRecommendedPatterns('exclude-entrepreneur');

  useEffect(() => {
    if (startup && !startup.scores) {
      updateScores();
    }
  }, [startup, updateScores]);

  useEffect(() => {
    // Get one recommended pattern (excluding entrepreneur category)
    getRecommendedPatterns(1);
  }, [getRecommendedPatterns]);


  if (!startup?.scores) return null;

  const lowestCategory = Object.entries(startup.scores).reduce((acc, [key, value]) =>
    value < acc[1] ? [key, value] : acc,
  );

  // Get all categories
  const allCategories = Object.values(CategoryEnum);

  // Sort the scores based on category order
  const sortedScores = Object.fromEntries(
    Object.entries(startup.scores)
      .sort(([keyA], [keyB]) => {
        const indexA = allCategories.indexOf(keyA as CategoryEnum);
        const indexB = allCategories.indexOf(keyB as CategoryEnum);
        return indexA - indexB;
      }),
  );


  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Performance Score
        </Typography>
        <Tooltip title="Your performance score is calculated based on the patterns you've applied and your self-assessment results. It represents your startup's progress across different perspectives.">
          <InfoIcon color="action" fontSize="small" />
        </Tooltip>
      </Box>

      {/* Overall Score Display - Now at the top */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${categoryColors[lowestCategory[0] as CategoryEnum]}15 0%, ${categoryColors[lowestCategory[0] as CategoryEnum]}05 100%)`,
          border: `1px solid ${categoryColors[lowestCategory[0] as CategoryEnum]}20`,
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: (theme) => `conic-gradient(from -90deg, ${theme.palette.primary.main} 0deg, ${theme.palette.primary.main} ${(startup.score || 0) * 3.6}deg, #e0e0e0 ${(startup.score || 0) * 3.6}deg, #e0e0e0 360deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
                  },
                  '&:hover .refresh-icon': {
                    opacity: 1,
                  },
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                      color: 'primary.main',
                      lineHeight: 1,
                    }}
                  >
                    {startup.score || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="500">
                    OVERALL
                  </Typography>
                </Box>
                <Tooltip title="Recalculate score">
                  <IconButton
                    size="small"
                    onClick={updateScores}
                    className="refresh-icon"
                    sx={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        bgcolor: 'background.paper',
                        transform: 'rotate(180deg)',
                        transition: 'transform 0.3s',
                      },
                    }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={8} md={9}>
            <Box>
              <Typography variant="body1" fontWeight="600" gutterBottom>
                Performance Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your startup is performing at {startup.score}% overall. Focus on improving your{' '}
                <Box component="span" sx={{ color: categoryColors[lowestCategory[0] as CategoryEnum], fontWeight: 600 }}>
                  {categoryDisplayNames[lowestCategory[0] as CategoryEnum]}
                </Box>{' '}
                perspective (currently at {lowestCategory[1]}%) to boost your overall score.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => navigate('/explore')}
                  sx={{
                    bgcolor: categoryColors[lowestCategory[0] as CategoryEnum],
                    color: 'white',
                    '&:hover': {
                      bgcolor: categoryColors[lowestCategory[0] as CategoryEnum],
                      filter: 'brightness(0.9)',
                    },
                  }}
                >
                  Improve {categoryDisplayNames[lowestCategory[0] as CategoryEnum]}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/self-assessment')}
                >
                  Take Assessment
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Progress Bars */}
          <Stack spacing={0.5}>
            {Object.entries(sortedScores).map(([category, score]) => (
              <Box key={category} sx={{ position: 'relative', height: 56 }}>
                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={score}
                  sx={{
                    height: 44,
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
                    height: '44px',
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
                        height: '44px',
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
                    height: '44px',
                    padding: '0 16px',
                  }}
                >
                  {/* Icon */}
                  <img src={categoryIcons[category as CategoryEnum]} alt={''} height={28} />
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
                    {score}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Recommended Pattern Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight="600" textAlign="center" gutterBottom>
              Recommended Pattern
            </Typography>
            {loading ? (
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2" textAlign="center">Loading recommendations...</Typography>
                </CardContent>
              </Card>
            ) : recommendedPatterns && recommendedPatterns.length > 0 ? (
              <Card
                sx={{
                  aspectRatio: '2/3',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: categoryColors[recommendedPatterns[0].category] || '#grey',
                    height: 40,
                    p: 2,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                />
                <CardMedia
                  sx={{
                    height: '35%',
                    bgcolor: 'grey.100',
                    position: 'relative',
                    '& img': {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    },
                  }}
                >
                  {recommendedPatterns[0].image ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${recommendedPatterns[0].image.url}`}
                      alt={recommendedPatterns[0].name}
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
                    variant="body1"
                    sx={{
                      color: categoryColors[recommendedPatterns[0].category],
                      fontWeight: 'bold',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mb: 1,
                      fontSize: '1rem',
                    }}
                  >
                    {recommendedPatterns[0].name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Improve your {categoryDisplayNames[recommendedPatterns[0].category as CategoryEnum]?.toLowerCase()}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Button
                    onClick={() => navigate(`/explore/${recommendedPatterns[0].id}`)}
                    variant="contained"
                    endIcon={<ArrowForward />}
                    fullWidth
                    sx={{
                      bgcolor: categoryColors[recommendedPatterns[0].category],
                      color: 'white',
                      '&:hover': {
                        bgcolor: categoryColors[recommendedPatterns[0].category],
                        filter: 'brightness(0.9)',
                      },
                    }}
                  >
                    Explore Pattern
                  </Button>
                </Box>
              </Card>
            ) : (
              <Card>
                <CardContent sx={{ p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Complete your assessment to get personalized recommendations.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 1, fontSize: '0.75rem', py: 0.5 }}
                    onClick={() => navigate('/explore')}
                  >
                    Browse Patterns
                  </Button>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default PerformanceScore;