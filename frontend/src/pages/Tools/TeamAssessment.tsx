import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { ArrowBack, Groups, Summarize } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AssessmentStep, { AssessmentStepRef } from '@/components/AssessmentStep';
import useNotifications from '@/store/notifications';
import { CategoryEnum, categoryDisplayNames, categoryColors, categoryIcons } from '@/utils/constants';
import AssessmentSummary from '@/components/AssessmentSummary';
import { supabaseGetQuestions } from '@/lib/supabase';
import useStartupQuestions from '@/hooks/useStartupQuestions';
import { Question } from '@/types/database';

const TeamAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user, startup, updateScores, updateStartup } = useAuthContext();
  const [, notificationsActions] = useNotifications();

  const [activeStep, setActiveStep] = useState(0);
  const assessmentRefs = useRef<(AssessmentStepRef | null)[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Categories for team assessment
  const categories = [
    CategoryEnum.stakeholders,
    CategoryEnum.product,
    CategoryEnum.sustainability,
    CategoryEnum.time_space,
  ];

  const currentCategory = categories[activeStep];

  // Fetch all questions and answers for summary (across all categories)
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const { fetchStartupQuestions, startupQuestions } = useStartupQuestions();

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        // Fetch questions for all categories in parallel
        const questionPromises = categories.map(category =>
          supabaseGetQuestions(category)
        );
        const questionArrays = await Promise.all(questionPromises);

        // Flatten all questions into a single array
        const flattenedQuestions = questionArrays.flat();
        setAllQuestions(flattenedQuestions);
      } catch (error) {
        console.error('Failed to fetch all questions:', error);
      }
    };

    if (startup?.id) {
      fetchAllQuestions();
      fetchStartupQuestions(startup.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startup?.id]);

  const handleNext = async () => {
    const currentRef = assessmentRefs.current[activeStep];
    if (currentRef) {
      await currentRef.submit();

      if (activeStep < categories.length - 1) {
        setActiveStep(prev => prev + 1);
      } else {
        // Complete assessment
        await completeAssessment();
      }
    }
  };

  const handleBack = async () => {
    // Save current form data before going back
    const currentRef = assessmentRefs.current[activeStep];
    if (currentRef) {
      await currentRef.submit();
    }
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepClick = async (step: number) => {
    // Save current form data before navigating
    const currentRef = assessmentRefs.current[activeStep];
    if (currentRef) {
      await currentRef.submit();
    }
    setActiveStep(step);
  };

  const completeAssessment = async () => {
    try {
      // Update scores
      await updateScores();

      // Update startup progress
      if (startup) {
        await updateStartup({
          id: startup.id,
          progress: {
            ...startup.progress,
            'team-assessment': true
          }
        });
      }

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Team assessment completed successfully',
      });

      navigate('/startup');
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to complete assessment',
      });
    }
  };

  const handleOpenSummary = () => {
    // Refetch latest data before opening summary
    if (startup?.id) {
      fetchStartupQuestions(startup.id);
    }
    setSummaryOpen(true);
  };

  if (!user || !startup) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="h6">Please log in to access the assessment</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title="Team Assessment" />
      <CenteredFlexBox>
        <Container maxWidth="md">
          <Box sx={{ mb: 1, mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/startup')}
              sx={{ color: 'text.secondary' }}
            >
              Back to Startup
            </Button>
            <Button
              startIcon={<Summarize />}
              onClick={handleOpenSummary}
              sx={{ color: 'text.secondary' }}
            >
              Summary
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Groups sx={{ fontSize: 64, color: categoryColors[CategoryEnum.team], mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  Team Assessment
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Evaluate your startup&apos;s performance across key dimensions
                </Typography>
              </Box>

              <Stepper
                activeStep={activeStep}
                nonLinear
                sx={{
                  mb: 4,
                  '& .MuiStepLabel-label': {
                    display: { xs: 'none', sm: 'block' },
                    cursor: 'pointer'
                  },
                  '& .MuiStepLabel-iconContainer': {
                    paddingRight: { xs: 0, sm: 2 }
                  },
                  '& .MuiStepButton-root': {
                    cursor: 'pointer'
                  },
                  '& .Mui-active .MuiStepIcon-root': {
                    color: categoryColors[CategoryEnum.team]
                  },
                  '& .Mui-active .MuiStepIcon-text': {
                    fill: 'white'
                  },
                  '& .Mui-completed .MuiStepIcon-root': {
                    color: categoryColors[CategoryEnum.team]
                  },
                  '& .Mui-completed .MuiStepIcon-text': {
                    fill: 'white'
                  },
                  '& .MuiStepIcon-root': {
                    cursor: 'pointer'
                  }
                }}
              >
                {categories.map((category, index) => (
                  <Step key={category}>
                    <StepLabel
                      onClick={() => handleStepClick(index)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: activeStep === index ? 'bold' : 'normal',
                          display: { xs: 'none', sm: 'block' }
                        }}
                      >
                        {categoryDisplayNames[category]}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Mobile Step Indicator */}
              <Box
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 4,
                  gap: 1
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {categories.length}:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {categoryDisplayNames[currentCategory]}
                </Typography>
              </Box>

              {/* Category Header */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    component="img"
                    src={categoryIcons[currentCategory]}
                    alt={categoryDisplayNames[currentCategory]}
                    sx={{
                      width: 40,
                      height: 40,
                      filter: `drop-shadow(0 0 10px ${categoryColors[currentCategory]})`
                    }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: categoryColors[currentCategory] }}
                  >
                    {categoryDisplayNames[currentCategory]}
                  </Typography>
                </Box>
              </Box>

              {/* Assessment Step for current category */}
              <AssessmentStep
                key={currentCategory}
                ref={(el) => { assessmentRefs.current[activeStep] = el; }}
                category={currentCategory}
                questionType="startup"
                startupId={startup.id}
                surveyName="Self Assessment"
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ 
                    backgroundColor: categoryColors[CategoryEnum.team],
                    color: 'white',
                    '&:hover': {
                      backgroundColor: categoryColors[CategoryEnum.team],
                      filter: 'brightness(0.9)'
                    }
                  }}
                >
                  {activeStep === categories.length - 1 ? 'Complete Assessment' : 'Next'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </CenteredFlexBox>

      {/* Assessment Summary Dialog - outside Container for proper modal behavior */}
      {allQuestions.length > 0 && startupQuestions && (
        <AssessmentSummary
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          title="Team Assessment"
          subtitle="Evaluate your startup&apos;s performance across key dimensions"
          questions={allQuestions}
          answers={startupQuestions}
          metadata={{ startup: startup?.name || undefined }}
        />
      )}
    </>
  );
};

export default TeamAssessment;