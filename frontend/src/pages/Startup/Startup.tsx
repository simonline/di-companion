import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
} from '@mui/material';
import {
  RocketLaunch,
  Group,
  Handshake,
  Description,
  Assessment,
  RecordVoiceOver,
  Slideshow,
  AttachMoney,
  Check,
  CheckCircle,
  ArrowForward
} from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';
import { categoryColors } from '@/utils/constants';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  path: string;
  completed?: boolean;
}

function Startup() {
  const { startup } = useAuthContext();
  const navigate = useNavigate();

  if (!startup) {
    return (
      <>
        <Header title="Startup" />
        <CenteredFlexBox>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No Startup Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You need to create or join a startup to access this page.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/create-startup')}
              >
                Create Startup
              </Button>
            </CardContent>
          </Card>
        </CenteredFlexBox>
      </>
    );
  }

  const steps: Step[] = [
    {
      id: 'startup-profile',
      title: 'Startup Profile',
      description: 'Complete your startup information and vision',
      icon: RocketLaunch,
      color: categoryColors.team,
      path: `/profile/startup/${startup.documentId}/edit`,
      completed: true // You can track actual completion status
    },
    {
      id: 'startup-members',
      title: 'Startup Members',
      description: 'Add team members and define roles',
      icon: Group,
      color: categoryColors.team,
      path: `/profile/startup/${startup.documentId}/team`,
      completed: false
    },
    {
      id: 'team-values',
      title: 'Team Values',
      description: 'Define your core values and culture',
      icon: Handshake,
      color: categoryColors.team,
      path: '/tools/team-values',
      completed: false
    },
    {
      id: 'team-contract',
      title: 'Team Contract',
      description: 'Establish clear agreements and expectations',
      icon: Description,
      color: categoryColors.team,
      path: '/tools/team-contract',
      completed: false
    },
    {
      id: 'team-assessment',
      title: 'Team Assessment',
      description: 'Evaluate team dynamics and performance',
      icon: Assessment,
      color: categoryColors.team,
      path: '/self-assessment',
      completed: false
    },
    {
      id: 'interviews',
      title: 'Interviews',
      description: 'Conduct and analyze customer interviews',
      icon: RecordVoiceOver,
      color: categoryColors.stakeholders,
      path: '/tools/interview-analyzer',
      completed: false
    },
    {
      id: 'pitch-deck',
      title: 'Pitch Deck',
      description: 'Upload and analyze your pitch deck',
      icon: Slideshow,
      color: categoryColors.product,
      path: '/tools/pitch-deck-analyzer',
      completed: false
    },
    {
      id: 'financial-plan',
      title: 'Financial Plan',
      description: 'Upload financial plan, analyzer coming soon',
      icon: AttachMoney,
      color: categoryColors.sustainability,
      path: '/tools/financial-plan',
      completed: false
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <>
      <Header title="Startup Journey" />
      <CenteredFlexBox>
        <Grid container spacing={3} sx={{ maxWidth: 1200 }}>
          {/* Header Section directly on background */}
          <Grid item xs={12}>
            <Stack spacing={3}>
              {/* Header Section */}
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'primary.main'
                  }}
                >
                  <RocketLaunch />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight="700">
                    {startup.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Complete your startup journey step by step
                  </Typography>
                </Box>
              </Stack>

              {/* Progress Section */}
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ position: 'relative', height: 32, display: 'flex', alignItems: 'center' }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        bgcolor: categoryColors.team
                      }
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      position: 'relative',
                      width: '100%',
                      textAlign: 'center',
                      fontWeight: 600,
                      color: progress > 50 ? 'white' : 'text.primary',
                      textShadow: progress > 50 ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      zIndex: 1,
                    }}
                  >
                    {completedSteps} of {steps.length} steps completed
                  </Typography>
                </Box>
                {progress === 100 && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: categoryColors.team }}>
                    🎉 Congratulations! You've completed all setup steps.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Steps Grid */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Complete Your Startup Journey
            </Typography>
            <Grid container spacing={2}>
              {steps.map((step, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={step.id}>
                  <Card
                    onClick={() => navigate(step.path)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: step.completed ? step.color : 'divider',
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, pb: { xs: 2, sm: 1 } }}>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          gap: 2,
                          mb: { xs: 0, sm: 2 },
                          flexDirection: { xs: 'row', sm: 'column' },
                          alignItems: { xs: 'flex-start', sm: 'center' }
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 56, sm: 48 },
                            height: { xs: 56, sm: 48 },
                            minWidth: { xs: 56, sm: 48 },
                            borderRadius: 2,
                            bgcolor: `${step.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {/* Step Number Badge - Positioned on icon box like User page */}
                          <Chip
                            label={index + 1}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              left: -8,
                              width: 24,
                              height: 24,
                              bgcolor: step.completed ? step.color : `color-mix(in srgb, ${step.color} 12.5%, white)`,
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
                          <step.icon sx={{ color: step.color, fontSize: { xs: 32, sm: 24 } }} />
                        </Box>
                        <Box sx={{ flex: 1, textAlign: { xs: 'left', sm: 'center' } }}>
                          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                            {step.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                        </Box>
                        {/* Arrow/Check button for mobile */}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(step.path);
                          }}
                          size="small"
                          sx={{
                            display: { xs: 'flex', sm: 'none' },
                            bgcolor: step.completed ? step.color : 'action.hover',
                            color: step.completed ? 'white' : 'inherit',
                            '&:hover': { 
                              bgcolor: step.completed ? step.color : 'action.selected',
                              opacity: step.completed ? 0.9 : 1,
                            },
                          }}
                        >
                          {step.completed ? <Check fontSize="small" /> : <ArrowForward fontSize="small" />}
                        </IconButton>
                      </Box>
                    </CardContent>

                    {/* Full-width button for larger screens */}
                    <Box sx={{ p: 2, pt: 0, display: { xs: 'none', sm: 'block' } }}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(step.path);
                        }}
                        variant={step.completed ? 'outlined' : 'contained'}
                        fullWidth
                        size="small"
                        endIcon={step.completed ? <CheckCircle /> : <ArrowForward />}
                        sx={{
                          color: step.completed ? step.color : 'white',
                          bgcolor: step.completed ? 'transparent' : step.color,
                          borderColor: step.completed ? step.color : 'transparent',
                          '&:hover': {
                            bgcolor: step.completed ? `${step.color}10` : step.color,
                            opacity: step.completed ? 1 : 0.9,
                          }
                        }}
                      >
                        {step.completed ? 'Review' : 'Start'}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CenteredFlexBox>
    </>
  );
}

export default Startup;