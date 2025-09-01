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
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import {
  steps,
  StartupFormValues,
  stepValidationSchemas,
  renderStepContent,
} from '../Startups/types';
import Header from '@/sections/Header';

const defaultInitialValues: StartupFormValues = {
  name: '',
  start_date: '',
  founders_count: 1,
  background: '',
  idea: '',
  product_type: '',
  industry: '',
  target_market: '',
  phase: '',
  is_problem_validated: false,
  qualified_conversations_count: 0,
  is_target_group_defined: false,
  is_prototype_validated: false,
  is_mvp_tested: false,
};

function StartupForm() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { createStartup, updateStartup, user, profile, updateProfile, startup } = useAuthContext();
  const [apiError, setApiError] = useState<string | null>(null);

  // Determine mode based on route - if path includes 'edit', we're editing
  const isEditRoute = window.location.pathname.includes('/edit');
  const mode = isEditRoute ? 'edit' : 'create';

  // If editing but no startup found, show error
  if (mode === 'edit' && !startup) {
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

  // Set initial values based on mode
  const formInitialValues = mode === 'edit' && startup ? {
    name: startup.name || '',
    start_date: startup.start_date || '',
    founders_count: startup.founders_count || 1,
    background: startup.background || '',
    idea: startup.idea || '',
    product_type: startup.product_type || '',
    industry: startup.industry || '',
    industry_other: startup.industry_other || '',
    target_market: startup.target_market || '',
    phase: startup.phase || '',
    is_problem_validated: startup.is_problem_validated || false,
    qualified_conversations_count: startup.qualified_conversations_count || 0,
    is_target_group_defined: startup.is_target_group_defined || false,
    is_prototype_validated: startup.is_prototype_validated || false,
    is_mvp_tested: startup.is_mvp_tested || false,
  } : defaultInitialValues;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      navigate('/startup');
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (
    values: StartupFormValues,
    { setSubmitting }: FormikHelpers<StartupFormValues>,
  ) => {
    setApiError(null);

    try {
      if (mode === 'create') {
        if (!user?.id) {
          throw new Error('User not found');
        }

        await createStartup({
          name: values.name,
          start_date: values.start_date,
          founders_count: values.founders_count,
          background: values.background,
          idea: values.idea,
          product_type: values.product_type,
          industry: values.industry,
          industry_other: values.industry_other,
          target_market: values.target_market,
          phase: values.phase,
          is_problem_validated: values.is_problem_validated,
          qualified_conversations_count: values.qualified_conversations_count,
          is_target_group_defined: values.is_target_group_defined,
          is_prototype_validated: values.is_prototype_validated,
          is_mvp_tested: values.is_mvp_tested,
          created_by_id: user.id,
          progress: {
            startup: true
          }
        });

        // Mark startup step as completed in user progress
        if (profile) {
          await updateProfile({
            id: user.id,
            progress: {
              ...profile.progress,
              startup: true
            }
          });
        }

        // When creating startup from User page (step 4), go back to /user
        navigate('/user');
      } else {
        // Edit mode - always from Startup page, go back to /startup
        if (!startup?.id) {
          throw new Error('Startup ID is required for editing');
        }

        await updateStartup({
          id: startup.id,
          progress: {
            ...startup.progress,
            'startup-profile': true
          },
          ...values,
        });

        navigate('/startup');
      }
    } catch (err: unknown) {
      console.error('API Error:', err);

      // Extract error message
      let errorMessage = mode === 'create'
        ? 'Failed to create startup'
        : 'Failed to update startup';

      if (err && typeof err === 'object') {
        const apiErr = err as any;
        errorMessage = apiErr?.error?.message || apiErr?.message || 'An unexpected error occurred';
      }

      setApiError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress percentage
  const progress = ((activeStep + 1) / steps.length) * 100;

  const title = mode === 'create'
    ? 'Register Your Startup'
    : `Edit ${startup?.name || 'Startup'}`;

  return (
    <>
      <Header title={title} />

      <Container maxWidth="md" sx={{ my: 8 }}>
        {mode === 'edit' && (
          <Box sx={{ mb: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/startup')}
              sx={{ color: 'text.secondary' }}
            >
              Back to Startup
            </Button>
          </Box>
        )}

        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 3, pt: 3 }}>
              {mode === 'edit' && (
                <>
                  <Typography variant="h5" gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Update your startup information to keep your profile current.
                  </Typography>
                </>
              )}

              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

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

            {apiError && (
              <Alert severity="error" sx={{ mx: 4, mb: 3 }}>
                {apiError}
              </Alert>
            )}

            <Formik
              initialValues={formInitialValues}
              validationSchema={stepValidationSchemas[activeStep]}
              onSubmit={handleSubmit}
              enableReinitialize={false}
            >
              {({
                errors,
                touched,
                isValid,
                setFieldValue,
                values,
                validateForm,
                submitForm,
                isSubmitting,
              }) => (
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
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={activeStep === 0 ? handleCancel : handleBack}
                      sx={{ px: 3 }}
                    >
                      {activeStep === 0 ? (mode === 'edit' ? 'Cancel' : 'Back') : 'Back'}
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
                      {activeStep === steps.length - 1
                        ? (mode === 'create' ? 'Submit' : 'Save Changes')
                        : 'Continue'}
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

export default StartupForm;