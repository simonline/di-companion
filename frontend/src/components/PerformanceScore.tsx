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
} from '@mui/material';
import { Check, FilterList, Refresh } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import {
  categoryDisplayNames,
  categoryColors,
  categoryIcons,
  CategoryEnum,
} from '@/utils/constants';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const PerformanceScore: React.FC = () => {
  const { startup, updateScores, updateStartup } = useAuthContext();
  const navigate = useNavigate();
  const [editingCategories, setEditingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CategoryEnum[]>([]);
  const allCategories = Object.values(CategoryEnum);

  useEffect(() => {
    if (startup && !startup.scores) {
      updateScores();
    }
  }, [startup, updateScores]);

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
          height: 60,
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
            height: 40,
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
            height: '40px',
            padding: '0 16px',
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
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="700" gutterBottom>
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

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            {/* Overall Score Display */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Overall Score
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your startup&apos;s overall maturity across all perspectives
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(#4CAF50 ${startup.score || 0}%, #e0e0e0 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'white',
                    },
                    '&:hover .refresh-icon': {
                      opacity: 1,
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
            </Paper>
          </Grid>
          <Grid item xs={12} sm={8}>
            {/* Progress Bars */}
            <Stack spacing={1}>
              {editingCategories ? (
                // Show all categories when editing
                allCategories.map(renderCategoryItem)
              ) : (
                // Show only selected categories when not editing
                Object.entries(sortedScores).map(([category, score]) => (
                  <Box key={category} sx={{ position: 'relative', height: 60 }}>
                    {/* Progress Bar */}
                    <LinearProgress
                      variant="determinate"
                      value={score}
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
                        {score}%
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PerformanceScore;