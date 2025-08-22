import React, { useEffect, useState } from 'react';
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
import { Check, FilterList, Refresh, ArrowForward, Image as ImageIcon } from '@mui/icons-material';
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
  const { startup, updateScores, updateStartup } = useAuthContext();
  const navigate = useNavigate();
  const [editingCategories, setEditingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CategoryEnum[]>([]);
  const allCategories = Object.values(CategoryEnum);
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

  useEffect(() => {
    if (startup?.categories?.length) {
      setSelectedCategories(startup.categories);
    } else {
      setSelectedCategories(allCategories);
    }
  }, [startup]);

  if (!startup?.scores) return null;

  const lowestCategory = Object.entries(startup.scores).reduce((acc, [key, value]) =>
    value < acc[1] ? [key, value] : acc,
  );

  // Get all categories or filter by startup.categories if available
  const availableCategories = startup?.categories?.length
    ? allCategories.filter(cat => startup.categories!.includes(cat))
    : allCategories;

  // Filter scores based on available categories
  const filteredScores = Object.fromEntries(
    Object.entries(startup.scores).filter(([key]) =>
      availableCategories.includes(key as CategoryEnum)
    )
  );

  // Sort the filtered scores based on category order
  const sortedScores = Object.fromEntries(
    Object.entries(filteredScores)
      .sort(([keyA], [keyB]) => {
        const indexA = availableCategories.indexOf(keyA as CategoryEnum);
        const indexB = availableCategories.indexOf(keyB as CategoryEnum);
        return indexA - indexB;
      }),
  );

  const toggleCategory = (category: CategoryEnum) => {
    if (!editingCategories) return;

    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.length > 1 ? prev.filter(c => c !== category) : prev; // Don't allow empty selection
      } else {
        return [...prev, category];
      }
    });
  };

  const saveCategories = async () => {
    if (startup) {
      try {
        await updateStartup({
          documentId: startup.documentId,
          categories: selectedCategories
        });
        setEditingCategories(false);
      } catch (error) {
        console.error('Failed to update categories:', error);
      }
    }
  };

  // Show all categories when editing
  const renderCategoryItem = (category: CategoryEnum) => {
    const score = startup.scores?.[category] || 0;

    return (
      <Box
        key={category}
        sx={{
          position: 'relative',
          height: 45,
          cursor: 'pointer',
          opacity: selectedCategories.includes(category) ? 1 : 0.5,
        }}
        onClick={() => toggleCategory(category)}
      >
        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            height: 32,
            borderRadius: 8,
            bgcolor: `${categoryColors[category]}66`,
            '& .MuiLinearProgress-bar': {
              bgcolor: categoryColors[category],
              borderRadius: 8,
            },
            border: selectedCategories.includes(category) ? '2px solid' : 'none',
            borderColor: selectedCategories.includes(category) ? categoryColors[category] : 'transparent',
          }}
        />
        {/* Category Info within the Progress Bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '32px',
            padding: '0 12px',
          }}
        >
          {/* Icon */}
          <img src={categoryIcons[category]} alt={''} height={24} />
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
            {categoryDisplayNames[category]}
          </Typography>
          {/* Percentage */}
          <Typography variant="body1" sx={{ color: 'white', ml: 'auto' }}>
            {score}%
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Performance Score
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {editingCategories ? (
            <Button
              startIcon={<Check />}
              variant="contained"
              size="small"
              onClick={saveCategories}
            >
              Save
            </Button>
          ) : (
            <Tooltip title="Filter perspectives to focus on">
              <Button
                startIcon={<FilterList />}
                variant="outlined"
                size="small"
                onClick={() => setEditingCategories(true)}
              >
                Filter
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Your performance score is calculated based on the patterns you've applied and your self-assessment results. It represents your startup's progress across different perspectives.">
            <InfoIcon color="action" fontSize="small" />
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* Progress Bars */}
          <Stack spacing={0.5}>
            {editingCategories ? (
              // Show all categories when editing
              allCategories.map(renderCategoryItem)
            ) : (
              // Show only selected categories when not editing
              Object.entries(sortedScores).map(([category, score]) => (
                <Box key={category} sx={{ position: 'relative', height: 45 }}>
                  {/* Progress Bar */}
                  <LinearProgress
                    variant="determinate"
                    value={score}
                    sx={{
                      height: 32,
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
                      height: '32px',
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
                          height: '32px',
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
                      height: '32px',
                      padding: '0 12px',
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
                      {score}%
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Overall Score Display */}
            <Grid item xs={6} md={5}>
              <Box>
                <Typography variant="subtitle1" fontWeight="600" textAlign="center" gutterBottom>
                  Overall Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                    borderRadius: '50%',
                    background: `conic-gradient(#4CAF50 ${startup.score || 0}%, #e0e0e0 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'white',
                    },
                    '&:hover .refresh-icon': {
                      opacity: 1,
                    },
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {startup.score || 0}%
                  </Typography>
                  <Tooltip title="Recalculate score">
                    <IconButton
                      size="small"
                      onClick={updateScores}
                      className="refresh-icon"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          bgcolor: 'background.paper',
                        },
                      }}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              </Box>
            </Grid>

            {/* Recommended Pattern Section */}
            <Grid item xs={6} md={7}>
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
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: categoryColors[recommendedPatterns[0].category] || '#grey',
                      height: 12,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                  <CardMedia
                    sx={{
                      height: 100,
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
                        <ImageIcon sx={{ fontSize: 36, color: 'grey.300' }} />
                      </Box>
                    )}
                  </CardMedia>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: categoryColors[recommendedPatterns[0].category],
                        fontWeight: 'bold',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        mb: 0.5,
                        fontSize: '0.875rem',
                      }}
                    >
                      {recommendedPatterns[0].name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Improve your {categoryDisplayNames[recommendedPatterns[0].category as CategoryEnum]?.toLowerCase()}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 1.5, pt: 0, mt: 'auto' }}>
                    <Button
                      onClick={() => navigate(`/explore/${recommendedPatterns[0].documentId}`)}
                      variant="contained"
                      size="small"
                      endIcon={<ArrowForward fontSize="small" />}
                      fullWidth
                      sx={{
                        bgcolor: categoryColors[recommendedPatterns[0].category],
                        color: 'white',
                        fontSize: '0.75rem',
                        py: 0.5,
                        '&:hover': {
                          bgcolor: categoryColors[recommendedPatterns[0].category],
                          filter: 'brightness(0.9)',
                        },
                      }}
                    >
                      Explore
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
        </Grid>
      </Grid>
    </>
  );
};

export default PerformanceScore;