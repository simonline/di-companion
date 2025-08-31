import React, { useEffect, useCallback, useState } from 'react';
import { Button, CircularProgress, Typography, Box, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';
import useMethod from '@/hooks/useMethod';
import useStartupMethod from '@/hooks/useStartupMethod';
import usePattern from '@/hooks/usePattern';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Header from '@/sections/Header';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuthContext } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';
import { Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { supabaseGetPatternMethods } from '@/lib/supabase';
import { Tables } from '@/types/database';

const validationSchema = Yup.object({
  result_text: Yup.string().required('Please describe the tools or methods you applied'),
  resultFiles: Yup.array().min(0, 'Files are optional'),
});

interface FormValues {
  result_text: string;
  resultFiles: File[];
}

const Methods: React.FC = () => {
  const { pattern_id } = useParams<{ pattern_id: string }>();
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
  const [patternMethods, setPatternMethods] = useState<Tables<'methods'>[]>([]);

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
    result_text: startupMethod?.result_text || '',
    // @ts-expect-error resultFiles is not a string
    resultFiles: startupMethod?.resultFiles || [],
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      if (!pattern || !startup || !method) return;
      if (startupMethod) {
        updateStartupMethod({
          id: startupMethod.id,
          result_text: values.result_text,
          resultFiles: values.resultFiles,
        });
      } else {
        createStartupMethod({
          startup: { set: { id: startup.id } },
          method: { set: { id: method.id } },
          pattern: { set: { id: pattern.id } },
          result_text: values.result_text,
          resultFiles: values.resultFiles,
        });
      }
      notificationsActions.push({
        options: {
          variant: 'success',
        },
        message: 'Method completed successfully',
      });
      // Continue with survey to complete the pattern
      navigate(`/progress/${pattern_id}/survey`);
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

  const FileUploadField = ({ field, form }: any) => {
    const onDrop = useCallback(
      (acceptedFiles: any) => {
        form.setFieldValue('resultFiles', acceptedFiles);
      },
      [form],
    );

    const handleRemoveFile = (fileToRemove: File) => {
      const updatedFiles = field.value.filter((file: any) => file !== fileToRemove);
      form.setFieldValue('resultFiles', updatedFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'image/*': [],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      },
    });

    const getFileIcon = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension || '')) {
        return <ImageIcon />;
      } else if (['pdf', 'doc', 'docx'].includes(extension || '')) {
        return <ArticleIcon />;
      }
      return <AttachFileIcon />;
    };

    return (
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mt: 2,
          mb: 2,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ textAlign: 'center' }}>
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: isDragActive ? 'primary.main' : 'text.secondary',
              mb: 2,
            }}
          />
          <Typography color="textSecondary">
            Attach artefacts or documentation (if available)
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1 }}>
            <ImageIcon sx={{ color: 'text.secondary' }} />
            <ArticleIcon sx={{ color: 'text.secondary' }} />
          </Box>
        </Box>

        {field.value.length > 0 && (
          <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
            {field.value.map((file: any, index: number) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                  borderRadius: 1,
                }}
              >
                {getFileIcon(file.name)}
                <Typography variant="body2" sx={{ ml: 1, flex: 1 }}>
                  {file.name}
                </Typography>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(file);
                  }}
                  startIcon={<DeleteIcon />}
                  color="error"
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    );
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
                              error={touched.result_text && Boolean(errors.result_text)}
                              helperText={touched.result_text && errors.result_text}
                              sx={{ mb: 3 }}
                            />
                          )}
                        </Field>

                        <Field name="resultFiles" component={FileUploadField} />

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
                            'Update your learnings'
                          ) : (
                            'Share your learnings'
                          )}
                        </Button>
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
