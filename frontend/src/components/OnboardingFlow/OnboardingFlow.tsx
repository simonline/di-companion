import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';

interface OnboardingStep {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  component: React.ComponentType<OnboardingStepProps>;
}

interface OnboardingStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: number;
  totalSteps: number;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  title?: string;
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  title = "Welcome to DI Companion",
  onComplete,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = useCallback(() => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else if (onComplete) {
      onComplete();
    } else {
      // Default completion behavior - redirect to dashboard
      navigate('/dashboard');
    }
  }, [activeStep, steps.length, onComplete, navigate]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  }, [activeStep]);

  // Redirect if user is not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const currentStepData = steps[activeStep];
  const progress = ((activeStep + 1) / steps.length) * 100;

  const stepProps: OnboardingStepProps = {
    onNext: handleNext,
    onBack: handleBack,
    isFirstStep: activeStep === 0,
    isLastStep: activeStep === steps.length - 1,
    currentStep: activeStep,
    totalSteps: steps.length,
  };

  const CurrentStepComponent = currentStepData?.component;

  if (!currentStepData || !CurrentStepComponent) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Onboarding step not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Header title={title} />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Header Section */}
            <Box sx={{ px: 4, pt: 4, pb: 2 }}>
              <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                {currentStepData.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {currentStepData.subtitle}
              </Typography>

              {/* Desktop Stepper */}
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  mb: 3,
                  '& .MuiStepLabel-label': {
                    display: { xs: 'none', sm: 'block' },
                    fontSize: '0.875rem',
                  },
                  '& .MuiStepLabel-iconContainer': {
                    paddingRight: { xs: 0, sm: 2 }
                  },
                }}
              >
                {steps.map((step) => (
                  <Step key={step.id}>
                    <StepLabel>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: activeStep === steps.findIndex(s => s.id === step.id) ? 'bold' : 'normal',
                          display: { xs: 'none', sm: 'block' }
                        }}
                      >
                        {step.label}
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
                  mb: 3,
                  gap: 1
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {steps.length}:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {currentStepData.label}
                </Typography>
              </Box>

              {/* Progress Bar */}
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 3,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            {/* Step Content */}
            <Box sx={{ px: 4, pb: 4 }}>
              <CurrentStepComponent {...stepProps} />
            </Box>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Your information is secure and will only be used to provide you with better guidance.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default OnboardingFlow;
export type { OnboardingStepProps, OnboardingStep };