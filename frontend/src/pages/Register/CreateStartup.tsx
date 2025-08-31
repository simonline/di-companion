import { useState } from 'react';
import { Form, Formik } from 'formik';
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
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import {
  steps,
  StartupFormValues,
  stepValidationSchemas,
  renderStepContent,
} from '@/pages/Startups/types';
import Header from '@/sections/Header';

const initialValues: StartupFormValues = {
  name: '',
  startDate: '',
  founders_count: 1,
  background: '',
  idea: '',
  productType: '',
  industry: '',
  targetMarket: '',
  phase: '',
  isProblemValidated: false,
  qualifiedConversationsCount: 0,
  isTargetGroupDefined: false,
  isPrototypeValidated: false,
  isMvpTested: false,
};

function CreateStartup() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { createStartup, user } = useAuthContext();
  const [apiError, setApiError] = useState<string | null>(null);

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
      <Header title="Register Your Startup" />

      <Container maxWidth="md" sx={{ my: 8 }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 3, pt: 3 }}>
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
              initialValues={initialValues}
              validationSchema={stepValidationSchemas[activeStep]}
              onSubmit={async (values, formikHelpers) => {
                const { setSubmitting } = formikHelpers;
                setSubmitting(true);
                setApiError(null);

                try {
                  console.log('Submitting startup data:', values);
                  if (!user?.id) {
                    throw new Error('User not found');
                  }
                  await createStartup({
                    name: values.name,
                    start_date: values.startDate,
                    founders_count: values.founders_count,
                    background: values.background,
                    idea: values.idea,
                    product_type: values.productType,
                    industry: values.industry,
                    industry_other: values.industryOther,
                    target_market: values.targetMarket,
                    phase: values.phase,
                    is_problem_validated: values.isProblemValidated,
                    qualified_conversations_count: values.qualifiedConversationsCount,
                    is_target_group_defined: values.isTargetGroupDefined,
                    is_prototype_validated: values.isPrototypeValidated,
                    is_mvp_tested: values.isMvpTested,
                    users: { set: [user.id] },
                  });
                  navigate('/startup');
                } catch (err: unknown) {
                  console.error('API Error:', err);

                  // Extract error message
                  let errorMessage = 'Failed to create startup';
                  if (err && typeof err === 'object') {
                    const apiErr = err as any;
                    errorMessage =
                      apiErr?.error?.message || apiErr?.message || 'An unexpected error occurred';
                  }

                  setApiError(errorMessage);
                } finally {
                  setSubmitting(false);
                }
              }}
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
                      backgroundColor: theme.palette.grey[50],
                    }}
                  >
                    <Button
                      variant="outlined"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ px: 3 }}
                    >
                      Back
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
                      {activeStep === steps.length - 1 ? 'Submit' : 'Continue'}
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

export default CreateStartup;
