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
import Meta from '@/components/Meta';
import { useAuth } from '@/hooks/useAuth';
import {
  steps,
  StartupFormValues,
  stepValidationSchemas,
  renderStepContent,
} from '@/pages/Startups/types';
import Header from '@/sections/Header';

function CreateStartup() {
  const theme = useTheme();
  // const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { createStartup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    values: StartupFormValues,
    { setSubmitting, setErrors }: FormikHelpers<StartupFormValues>,
  ): Promise<void> => {
    setIsSubmitting(true);
    try {
      await createStartup(values);
      // Success! You could redirect here
      // navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Startup creation error:', error);
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
      <Header>
        <Meta title="Register Your Startup" />
        <Container maxWidth="md">
          <Box sx={{ py: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: 'bold', mb: 3 }}
            >
              Register Your Startup
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4 }}>
              Tell us about your startup to get personalized guidance and support.
            </Typography>
          </Box>
        </Container>
      </Header>

      <Container maxWidth="md" sx={{ mb: 8 }}>
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

            <Formik
              initialValues={{
                name: '',
                startDate: '',
                foundersCount: 1,
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
              }}
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
