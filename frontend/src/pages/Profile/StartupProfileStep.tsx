import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Form, Formik } from 'formik';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { steps, renderStepContent } from '@/pages/Startups/types';
import { useAuthContext } from '@/hooks/useAuth';
import { Startup } from '@/types/supabase';

const StartupProfileStep: React.FC = () => {
  const { startupId, stepId } = useParams<{ startupId: string; stepId: string }>();
  const { user, startup } = useAuthContext();

  const step = steps[parseInt(stepId || '0')];

  if (!user) return null;

  return (
    <FullSizeCenteredFlexBox>
      <Box p={2}>
        <Typography variant="h4" align="center" gutterBottom>
          {step}
        </Typography>

        <Formik
          initialValues={startup || ({} as Partial<Startup>)}
          onSubmit={(values) => {
            console.log(values);
          }}
        >
          {(formikProps) => (
            <Form>
              {renderStepContent(
                parseInt(stepId || '0'),
                formikProps.errors,
                formikProps.touched,
                formikProps.setFieldValue,
                formikProps.values,
              )}
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button type="submit" variant="contained" color="primary">
                  Save
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </FullSizeCenteredFlexBox>
  );
};

export default StartupProfileStep;
