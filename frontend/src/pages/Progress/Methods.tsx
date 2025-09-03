import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Typography, Box, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';
import useMethod from '@/hooks/useMethod';
import useStartupMethod from '@/hooks/useStartupMethod';
import usePattern from '@/hooks/usePattern';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Header from '@/sections/Header';
import ArticleIcon from '@mui/icons-material/Article';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuthContext } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';
import { Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { supabaseGetPatternMethods } from '@/lib/supabase';
import { Method } from '@/types/database';
import DocumentManager from '@/components/DocumentManager';

const validationSchema = Yup.object({
  resultText: Yup.string().required('Please describe the tools or methods you applied'),
});

interface FormValues {
  resultText: string;
}

const Methods: React.FC = () => {
  const { patternId } = useParams<{ patternId: string }>();
  const navigate = useNavigate();
  const [, notificationsActions] = useNotifications();
  const { startup } = useAuthContext();
  const { fetchPattern, pattern, loading: patternLoading, error: patternError } = usePattern();
  const { fetchMethod, method, loading: methodLoading, error: methodError } = useMethod();
  const {
    findPatternMethod,
    createStartupMethod,
    updateStartupMethod,
    startupMethod,
    loading: startupMethodLoading,
    error: startupMethodError,
  } = useStartupMethod();
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [patternMethods, setPatternMethods] = useState<Method[]>([]);

  useEffect(() => {
    fetchPattern(patternId as string);
  }, [fetchPattern, patternId]);

  useEffect(() => {
    // Fetch methods separately
    if (pattern?.id) {
      supabaseGetPatternMethods(pattern.id).then(setPatternMethods);
    }
  }, [pattern]);

  useEffect(() => {
    if (patternMethods.length > 0) {
      fetchMethod(patternMethods[0].id);
    }
  }, [fetchMethod, patternMethods]);

  useEffect(() => {
    if (startup && pattern && method) {
      findPatternMethod(startup.id, pattern.id, method.id);
    }
  }, [findPatternMethod, startup, pattern, method]);

  const initialValues: FormValues = {
    resultText: startupMethod?.result_text || '',
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      if (!pattern || !startup || !method) return;
      if (startupMethod) {
        await updateStartupMethod({
          id: startupMethod.id,
          result_text: values.resultText,
        }, []);
        notificationsActions.push({
          options: {
            variant: 'success',
          },
          message: 'Method updated successfully',
        });
      } else {
        await createStartupMethod({
          startup_id: startup.id,
          method_id: method.id,
          pattern_id: pattern.id,
          result_text: values.resultText,
        }, []);
        notificationsActions.push({
          options: {
            variant: 'success',
          },
          message: 'Method saved successfully. You can now upload result files below.',
        });
        // Don't navigate immediately to allow file uploads
        setSubmitting(false);
        return;
      }
      // Only navigate after update or if user chooses to skip files
      navigate(`/progress/${patternId}/survey`);
    } catch (error) {
      console.error('Error submitting form:', error);
      notificationsActions.push({
        options: {
          variant: 'error',
        },
        message: 'Method could not be completed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setMethodModalOpen(false);
  };

  if ((patternLoading || patternMethods.length > 0) && (methodLoading || startupMethodLoading)) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (patternError || methodError || startupMethodError) {
    console.error('Error loading methods:', patternError || methodError || startupMethodError);
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 4,
        }}
      >
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error loading methods
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!pattern) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 4,
        }}
      >
        <Typography variant="h6">Pattern not found</Typography>
      </Box>
    );
  }
  console.log(method)

  return (
    <>
      <Header title={pattern.name} />
      <CenteredFlexBox>
        <Grid container spacing={3} sx={{ maxWidth: '800px', width: '100%' }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/progress/${pattern.id}`)}
                startIcon={<ArrowBackIcon />}
                size="small"
                sx={{ mb: 4 }}
              >
                Back to Pattern
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {pattern.name}
                </Typography>
              </Box>


              {!method ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    This pattern has no assigned methods yet.
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Please refer to your Coach for guidance.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      {method.name}
                    </Typography>
                    {method.url && (
                      <Button
                        variant="contained"
                        onClick={() => setMethodModalOpen(true)}
                        startIcon={<ArticleIcon />}
                        sx={{ mb: 3 }}
                      >
                        View Method Details
                      </Button>
                    )}
                  </Box>

                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form>
                        <Field name="resultText">
                          {({ field }: any) => (
                            <TextField
                              {...field}
                              fullWidth
                              multiline
                              rows={4}
                              label="Which tools or methods did you apply here?"
                              error={touched.resultText && Boolean(errors.resultText)}
                              helperText={touched.resultText && errors.resultText}
                              sx={{ mb: 3 }}
                            />
                          )}
                        </Field>

                        {/* Document Manager for result files */}
                        {startupMethod && (
                          <Box sx={{ mt: 3, mb: 3 }}>
                            <DocumentManager
                              category="method_result"
                              entityType="startup_method"
                              entityId={startupMethod.id}
                              entityField="resultFiles"
                              title="Result Files"
                              description="Upload artefacts or documentation"
                              color="primary"
                            />
                          </Box>
                        )}

                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          disabled={patternLoading || methodLoading || isSubmitting}
                          sx={{ mt: 2 }}
                        >
                          {isSubmitting ? (
                            <CircularProgress size={24} />
                          ) : startupMethod ? (
                            'Update and Continue'
                          ) : (
                            'Save your learnings'
                          )}
                        </Button>

                        {startupMethod && (
                          <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={() => navigate(`/progress/${patternId}/survey`)}
                            sx={{ mt: 2 }}
                          >
                            Continue to Survey
                          </Button>
                        )}
                      </Form>
                    )}
                  </Formik>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </CenteredFlexBox>

      {/* Method details modal */}
      <Dialog
        open={methodModalOpen}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        aria-labelledby="method-details-dialog"
      >
        <DialogTitle id="method-details-dialog">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{method?.name} - Details</Typography>
            <IconButton edge="end" color="inherit" onClick={handleCloseModal} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '75vh' }}>
          {method?.url && (
            <iframe
              src={method.url.replace('notion.site', 'notion.site/ebd')}
              title={`${method.name} details`}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
          {method?.url && (
            <Button
              variant="contained"
              color="primary"
              href={method.url}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<ArticleIcon />}
            >
              Open in New Tab
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Methods;
