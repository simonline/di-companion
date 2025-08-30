import { useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import {
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  useTheme,
  LinearProgress,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import {
  steps,
  StartupFormValues,
  stepValidationSchemas,
  renderStepContent,
} from '@/pages/Startups/types';
import Header from '@/sections/Header';

function StartupEdit() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { startup, updateStartup } = useAuthContext();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!startup) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5">Startup not found</Typography>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  // Convert Startup type to StartupFormValues for the form
  const initialValues: StartupFormValues = {
    name: startup.name || '',
    startDate: startup.startDate || '',
    foundersCount: startup.foundersCount || 1,
    background: startup.background || '',
    idea: startup.idea || '',
    productType: startup.productType || '',
    industry: startup.industry || '',
    industryOther: startup.industryOther || '',
    targetMarket: startup.targetMarket || '',
    phase: startup.phase || '',
    isProblemValidated: startup.isProblemValidated || false,
    qualifiedConversationsCount: startup.qualifiedConversationsCount || 0,
    isTargetGroupDefined: startup.isTargetGroupDefined || false,
    isPrototypeValidated: startup.isPrototypeValidated || false,
    isMvpTested: startup.isMvpTested || false,
  };

  const handleSubmit = async (
    values: StartupFormValues,
    { setSubmitting, setErrors }: FormikHelpers<StartupFormValues>,
  ): Promise<void> => {
    setIsSubmitting(true);
    try {
      await updateStartup({
        id: id!,
        ...values,
      });
      // Success! Redirect back to profile
      navigate(`/profile/startup/${id}`);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Startup update error:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Calculate progress percentage
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <>
      <Header title="Edit Startup" />
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Box sx={{ mb: 1, mt: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/startup')}
            sx={{ color: 'text.secondary' }}
          >
            Back to Startup
          </Button>
        </Box>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 3, pt: 3 }}>
              <Typography variant="h5" gutterBottom>
                Edit {startup.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Update your startup information to keep your profile current.
              </Typography>

              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  mb: 4,
                  '& .MuiStepLabel-label': {
                    display: { xs: 'none', sm: 'block' }
                  },
                  '& .MuiStepLabel-iconContainer': {
                    paddingRight: { xs: 0, sm: 2 }
                  },
                  '& .MuiStepLabel-alternativeLabel': {
                    marginTop: { xs: 0, sm: 1 }
                  },
                  '& .MuiStepConnector-line': {
                    marginTop: { xs: 0, sm: '14px' },
                    paddingRight: { xs: 0, sm: '28px' }
                  }
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: activeStep === steps.indexOf(label) ? 'bold' : 'normal',
                          display: { xs: 'none', sm: 'block' }
                        }}
                      >
                        {label}
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
                  mb: 2,
                  gap: 1
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {steps.length}:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {steps[activeStep]}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 4,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Formik
              initialValues={initialValues}
              validationSchema={stepValidationSchemas[activeStep]}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, setFieldValue, values, validateForm, submitForm }) => (
                <Form>
                  <Box sx={{ px: 4, py: 3 }}>
                    {renderStepContent(activeStep, errors, touched, setFieldValue, values)}
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 3,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.grey[50],
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={
                        activeStep === 0 ? () => navigate(`/profile/startup/${id}`) : handleBack
                      }
                      sx={{ px: 3 }}
                    >
                      {activeStep === 0 ? 'Cancel' : 'Back'}
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!isValid || isSubmitting}
                      onClick={async () => {
                        const stepErrors = (await validateForm()) as Record<string, string>;
                        const stepFields = Object.keys(stepValidationSchemas[activeStep].fields);
                        const hasStepErrors = stepFields.some((field) => stepErrors[field]);

                        if (!hasStepErrors) {
                          if (activeStep < steps.length - 1) {
                            handleNext();
                          } else {
                            submitForm();
                          }
                        }
                      }}
                      sx={{
                        px: 4,
                        position: 'relative',
                        '&.Mui-disabled': {
                          backgroundColor: theme.palette.action.disabledBackground,
                        },
                      }}
                    >
                      {isSubmitting && (
                        <LinearProgress
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                          }}
                        />
                      )}
                      {activeStep === steps.length - 1 ? 'Save Changes' : 'Continue'}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Your information is secure and will only be used to provide you with better guidance.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default StartupEdit;
