import React, { useEffect, useCallback } from 'react';
import { Button, CircularProgress, Typography, Box, TextField, Paper, Link } from '@mui/material';
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

const validationSchema = Yup.object({
  resultText: Yup.string().required('Please describe the tools or methods you applied'),
  resultFiles: Yup.array().min(0, 'Files are optional'),
});

interface FormValues {
  resultText: string;
  resultFiles: File[];
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

  useEffect(() => {
    fetchPattern(patternId as string);
  }, [fetchPattern, patternId]);

  useEffect(() => {
    if (pattern && pattern.method) {
      fetchMethod(pattern.method.documentId);
    }
  }, [fetchMethod, pattern]);

  useEffect(() => {
    console.log('patternLoading', patternLoading);
    console.log('startupPatternLoading', startupMethodLoading);
    console.log('methodLoading', methodLoading);
  }, [patternLoading, startupMethodLoading, methodLoading]);


  useEffect(() => {
    if (startup && pattern && method) {
      findPatternMethod(startup.documentId, pattern.documentId, method.documentId);
    }
  }, [findPatternMethod, startup, pattern, method]);

  const initialValues: FormValues = {
    resultText: startupMethod?.resultText || '',
    // @ts-expect-error resultFiles is not a string
    resultFiles: startupMethod?.resultFiles || [],
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      if (!pattern || !startup || !method) return;
      if (startupMethod) {
        updateStartupMethod({
          documentId: startupMethod.documentId,
          resultText: values.resultText,
          resultFiles: values.resultFiles,
        });
      } else {
        createStartupMethod({
          startup: { set: { documentId: startup.documentId } },
          method: { set: { documentId: method.documentId } },
          pattern: { set: { documentId: pattern.documentId } },
          resultText: values.resultText,
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

  if (patternLoading || methodLoading || startupMethodLoading) {
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

  return (
    <>
      <Header title={pattern.name} />
      <CenteredFlexBox>
        <Grid container spacing={3} sx={{ maxWidth: '1200px', width: '100%' }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <Typography variant="h5">{pattern.name}</Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/progress/${pattern.documentId}`)}
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Pattern
                </Button>
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
                <Box sx={{ width: '100%', maxWidth: 600, mt: 4, px: 2 }}>
                  {method.url && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Method Details
                      </Typography>
                      <Link href={method.url} target="_blank" rel="noopener noreferrer">
                        View Method Documentation
                      </Link>
                    </Box>
                  )}
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
    </>
  );
};

export default Methods;
