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
  IconButton
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
          {/* Combined Header and Progress Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
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
                    <Chip
                      label={`${completedSteps} of ${steps.length} completed`}
                      size="small"
                      sx={{
                        bgcolor: progress === 100 ? categoryColors.team : 'default',
                        color: progress === 100 ? 'white' : 'inherit'
                      }}
                    />
                  </Stack>

                  {/* Progress Section */}
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: categoryColors.team
                        }
                      }}
                    />
                    {progress === 100 && (
                      <Typography variant="body2" sx={{ mt: 1, color: categoryColors.team }}>
                        🎉 Congratulations! You've completed all setup steps.
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
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
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: step.completed ? step.color : 'divider',
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {/* Step Number Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: step.completed ? step.color : 'grey.200',
                        color: step.completed ? 'white' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {index + 1}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: `${step.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                          }}
                        >
                          <step.icon sx={{ color: step.color, fontSize: 24 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        onClick={() => navigate(step.path)}
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