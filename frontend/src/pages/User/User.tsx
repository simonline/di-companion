import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  CardMedia,
  IconButton,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Person,
  Assessment,
  RocketLaunch,
  ArrowForward,
  Check,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import useRecommendedPatterns from '@/hooks/useRecommendedPatterns';
import Header from '@/sections/Header';
import { categoryColors, CategoryEnum } from '@/utils/constants';
import { getAvatarUrl } from '@/lib/strapi';
import { CenteredFlexBox } from '@/components/styled';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  completed: boolean;
}

const User: React.FC = () => {
  const navigate = useNavigate();
  const { user, startup } = useAuthContext();
  const { getRecommendedPatterns, recommendedPatterns, loading } = useRecommendedPatterns(CategoryEnum.entrepreneur);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    // Get one recommended pattern
    getRecommendedPatterns(1);
  }, [getRecommendedPatterns]);

  useEffect(() => {
    // Determine completion status for each step
    const profileCompleted = !!(
      user?.givenName &&
      user?.familyName &&
      user?.email
    );

    // Check if user has completed assessment (we'll check if they have bio or position as proxy)
    const assessmentCompleted = !!(
      user?.bio ||
      user?.position
    );

    const startupCompleted = !!(startup?.documentId);

    setOnboardingSteps([
      {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your personal and professional information to personalize your experience.',
        icon: <Person sx={{ fontSize: 32 }} />,
        route: '/profile',
        completed: profileCompleted,
      },
      {
        id: 'values',
        title: 'Your Values',
        description: 'Define your personal values through our guided workshop process.',
        icon: <Assessment sx={{ fontSize: 32 }} />,
        route: '/tools/user-values',
        completed: false, // TODO: Add completion logic
      },
      {
        id: 'assessment',
        title: 'Self Assessment',
        description: 'Take the entrepreneurship assessment to understand your strengths and areas for growth.',
        icon: <Assessment sx={{ fontSize: 32 }} />,
        route: '/self-assessment',
        completed: assessmentCompleted,
      },
      {
        id: 'startup',
        title: 'Create Your Startup',
        description: 'Set up your startup profile to access personalized patterns and recommendations.',
        icon: <RocketLaunch sx={{ fontSize: 32 }} />,
        route: startup?.documentId ? `/profile/startup/${startup.documentId}/edit` : '/create-startup',
        completed: startupCompleted,
      },
    ]);
  }, [user, startup]);

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const totalSteps = onboardingSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const avatarUrl = getAvatarUrl(user?.avatar?.formats?.thumbnail?.url);
  const userInitials = `${user?.givenName?.charAt(0) || ''}${user?.familyName?.charAt(0) || ''}`;

  return (
    <>
      <Header title="Getting Started" />
      <CenteredFlexBox>
        <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
          {/* Header Section directly on background */}
          <Grid item xs={12}>
            <Stack spacing={3}>
              {/* Header Section */}
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  src={avatarUrl}
                  sx={{ width: 60, height: 60 }}
                  alt={`${user?.givenName} ${user?.familyName}`}
                >
                  {userInitials || user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight="700">
                    {user?.givenName} {user?.familyName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Welcome! Let's set up your innovation toolkit and get you started
                  </Typography>
                </Box>
              </Stack>

              {/* Progress Section */}
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ position: 'relative', height: 32, display: 'flex', alignItems: 'center' }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercentage}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        bgcolor: categoryColors.entrepreneur,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      position: 'relative',
                      width: '100%',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: progressPercentage > 50 ? 'white' : 'text.primary',
                      textShadow: progressPercentage > 50 ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      zIndex: 1,
                    }}
                  >
                    {completedSteps} of {totalSteps} steps completed
                  </Typography>
                </Box>
                {progressPercentage === 100 && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: categoryColors.entrepreneur }}>
                    🎉 Congratulations! You've completed all onboarding steps.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>
          {/* Onboarding Steps */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Complete Your Onboarding
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'visible', mt: 1.5 }}>
              {onboardingSteps.map((step, index) => (
                <Card
                  key={step.id}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: step.completed ? '2px solid' : 'none',
                    borderColor: step.completed ? categoryColors.entrepreneur : 'divider',
                    bgcolor: 'background.paper',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => navigate(step.route)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${categoryColors.entrepreneur}20`,
                          color: categoryColors.entrepreneur,
                          position: 'relative',
                        }}
                      >
                        {/* Corner number badge */}
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            left: -8,
                            width: 24,
                            height: 24,
                            bgcolor: step.completed ? categoryColors.entrepreneur : `color-mix(in srgb, ${categoryColors.entrepreneur} 12.5%, white)`,
                            color: step.completed ? 'white' : 'text.primary',
                            fontWeight: 700,
                            border: '2px solid',
                            borderColor: 'background.paper',
                            zIndex: 1,
                            '& .MuiChip-label': {
                              px: 0,
                              py: 0,
                            }
                          }}
                        />
                        {step.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {step.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: step.completed ? categoryColors.entrepreneur : 'action.hover',
                          color: step.completed ? 'white' : 'inherit',
                          '&:hover': {
                            bgcolor: step.completed ? categoryColors.entrepreneur : 'action.selected'
                          },
                        }}
                      >
                        {step.completed ? <Check fontSize="small" /> : <ArrowForward fontSize="small" />}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Recommended Pattern Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recommended for You
            </Typography>
            {loading ? (
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Loading recommendations...</Typography>
                </CardContent>
              </Card>
            ) : recommendedPatterns && recommendedPatterns.length > 0 ? (
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
                    bgcolor: categoryColors[recommendedPatterns[0].category] || '#grey',
                    height: 20,
                    p: 1,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                />
                <CardMedia
                  sx={{
                    height: 140,
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
                    variant="subtitle1"
                    sx={{
                      color: categoryColors[recommendedPatterns[0].category],
                      fontWeight: 'bold',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mb: 1,
                    }}
                  >
                    {recommendedPatterns[0].name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This pattern can help you improve your startup's performance.
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Button
                    onClick={() => navigate(`/explore/${recommendedPatterns[0].documentId}`)}
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
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Complete your profile and assessment to get personalized pattern recommendations.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/explore')}
                  >
                    Browse All Patterns
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </CenteredFlexBox>
    </>
  );
};

export default User;