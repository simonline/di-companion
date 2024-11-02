import { useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { Typography, Button, Box, Stepper, Step, StepLabel } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import Meta from '@/components/Meta';
import { useAuth } from '@/hooks/useAuth';
import {
  steps,
  StartupFormValues,
  stepValidationSchemas,
  renderStepContent,
} from '@/pages/Startups/types';

function CreateStartup() {
  // const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { createStartup } = useAuth();

  const handleSubmit = async (
    values: StartupFormValues,
    { setSubmitting, setErrors }: FormikHelpers<StartupFormValues>,
  ): Promise<void> => {
    try {
      createStartup(values);
      // const startup = createStartup(values);

      // if (startup) {
      //     navigate('/dashboard');
      // }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Startup creation error:', error);
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <>
      <Meta title="Create Startup" />
      <FullSizeCenteredFlexBox sx={{ alignItems: 'start' }}>
        <Box sx={{ width: '100%', maxWidth: 600, p: 2 }}>
          <Box mb={4}>
            <Typography variant="h4" align="center" gutterBottom mb={4}>
              Create Your Startup
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel></StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Formik
            initialValues={{
              name: '',
              startDate: '',
              foundersCount: 0,
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
                {renderStepContent(activeStep, errors, touched, setFieldValue, values)}
                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ color: 'primary.main' }}
                  >
                    BACK
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    onClick={async () => {
                      console.log(activeStep === steps.length - 1);
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
                  >
                    {activeStep === steps.length - 1 ? 'SUBMIT' : 'NEXT'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default CreateStartup;
