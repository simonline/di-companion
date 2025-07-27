import React, { useEffect, useState } from 'react';
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
  IconButton,
} from '@mui/material';
import { ArrowForward, Check, FilterList, Refresh } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import ImageIcon from '@mui/icons-material/Image';
import { CenteredFlexBox } from '@/components/styled';
import {
  categoryDisplayNames,
  categoryColors,
  categoryIcons,
  CategoryEnum,
} from '@/utils/constants';
import Header from '@/sections/Header';
import usePatterns from '@/hooks/usePatterns';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import { useAuthContext } from '@/hooks/useAuth';
import type { Pattern, StartupPattern } from '@/types/strapi';
import { getPatternStatus } from '@/pages/Progress/Progress';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useRecommendedPatterns from '@/hooks/useRecommendedPatterns';
import Loading from '@/components/Loading';
import {
  Description,
  Psychology,
  RecordVoiceOver,
  Slideshow
} from '@mui/icons-material';

interface DashboardWidgetProps {
  startupPatterns: StartupPattern[];
  patterns: Pattern[];
}

const MaturityScoreSection: React.FC<DashboardWidgetProps> = () => {
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
                Overall Score
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
                  background: `conic-gradient(#4CAF50 ${startup.score || 0}%, #e0e0e0 0)`,
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
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2}>
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
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={() => navigate('/self-assessment')}
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
          Based on your current performance score, we recommend the following pattern to help you
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

const ToolsSection: React.FC<DashboardWidgetProps> = () => {
  const navigate = useNavigate();
  const { startup } = useAuthContext();
  const isSolo = startup?.foundersCount === 1;

  const tools = [
    {
      id: 'team-contract',
      title: isSolo ? 'Solo Contract' : 'Team Contract',
      description: isSolo
        ? 'Define your personal commitment and goals'
        : 'Establish clear agreements with your team',
      icon: Description,
      color: '#1976d2',
      action: 'Create',
      path: '/tools/team-contract'
    },
    {
      id: 'team-values',
      title: 'Team Values',
      description: 'Define your corporate value set through collaboration',
      icon: Psychology,
      color: '#388e3c',
      action: 'Define',
      path: '/tools/team-values'
    },
    {
      id: 'interview-analyzer',
      title: 'Interview Analyzer',
      description: 'Record and analyze customer conversations',
      icon: RecordVoiceOver,
      color: '#f57c00',
      action: 'Record',
      path: '/tools/interview-analyzer'
    },
    {
      id: 'pitch-deck-analyzer',
      title: 'Pitch Deck Analyzer',
      description: 'Get AI-powered feedback on your presentations',
      icon: Slideshow,
      color: '#7b1fa2',
      action: 'Analyze',
      path: '/tools/pitch-deck-analyzer'
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="700" gutterBottom>
          Essential Tools
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Powerful tools to help you build and grow your startup
        </Typography>

        <Grid container spacing={2}>
          {tools.map((tool) => (
            <Grid item xs={12} sm={6} key={tool.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: tool.color,
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${tool.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}
                    >
                      <tool.icon sx={{ color: tool.color, fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        {tool.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    onClick={() => navigate(tool.path)}
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: tool.color,
                      color: 'white',
                      '&:hover': {
                        bgcolor: tool.color,
                        opacity: 0.9,
                      },
                    }}
                  >
                    {tool.action} {tool.title}
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

const Dashboard: React.FC = () => {
  const { startup } = useAuthContext();
  const { fetchPatterns, patterns, error: patternsError } = usePatterns();
  const {
    fetchStartupPatterns,
    startupPatterns,
    error: startupPatternsError,
  } = useStartupPatterns();
  const [searchParams] = useSearchParams();

  // Feature flag: show tools only if ?tools=1 is in the URL
  const showTools = searchParams.get('tools') === '1';

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
            {showTools && (
              <Grid item sm={12}>
                <ToolsSection startupPatterns={startupPatterns} patterns={patterns} />
              </Grid>
            )}
          </Grid>
        ) : (
          <Loading />
        )}
      </CenteredFlexBox>
    </>
  );
};

export default Dashboard;
