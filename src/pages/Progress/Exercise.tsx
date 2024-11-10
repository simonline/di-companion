import React, { useEffect, useCallback } from 'react';
import { Button, CircularProgress, Typography, Box, TextField, Paper } from '@mui/material';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import useExercise from '@/hooks/useExercise';
import useStartupExercise from '@/hooks/useStartupExercise';
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
import { useAuth } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';

const validationSchema = Yup.object({
  resultText: Yup.string().required('Please describe the tools or methods you applied'),
  resultFiles: Yup.array().min(0, 'Files are optional'),
});

interface FormValues {
  resultText: string;
  resultFiles: File[];
}

const Exercise: React.FC = () => {
  const { patternId } = useParams<{ patternId: string }>();
  const navigate = useNavigate();
  const [, notificationsActions] = useNotifications();
  const { startup } = useAuth();
  const { fetchPattern, pattern, loading: patternLoading, error: patternError } = usePattern();
  const { fetchExercise, exercise, loading: exerciseLoading, error: exerciseError } = useExercise();
  const {
    findPatternExercise,
    createStartupExercise,
    updateStartupExercise,
    startupExercise,
    loading: startupExerciseLoading,
    error: startupExerciseError,
  } = useStartupExercise();

  useEffect(() => {
    fetchPattern(patternId as string);
  }, [fetchPattern, patternId]);

  useEffect(() => {
    if (pattern && pattern.exercise) {
      fetchExercise(pattern.exercise.documentId);
    }
  }, [fetchExercise, pattern]);

  useEffect(() => {
    if (startup && pattern && exercise) {
      findPatternExercise(startup.documentId, pattern.documentId, exercise.documentId);
    }
  }, [findPatternExercise, startup, pattern, exercise]);

  const initialValues: FormValues = {
    resultText: startupExercise?.resultText || '',
    // @ts-expect-error resultFiles is not a string
    resultFiles: startupExercise?.resultFiles || [],
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      if (!pattern || !startup || !exercise) return;
      if (startupExercise) {
        updateStartupExercise({
          documentId: startupExercise.documentId,
          resultText: values.resultText,
          resultFiles: values.resultFiles,
        });
      } else {
        createStartupExercise({
          startup: { set: { documentId: startup.documentId } },
          exercise: { set: { documentId: exercise.documentId } },
          pattern: { set: { documentId: pattern.documentId } },
          resultText: values.resultText,
          resultFiles: values.resultFiles,
        });
      }
      notificationsActions.push({
        options: {
          variant: 'success',
        },
        message: 'Exercise completed successfully',
      });
      // Continue with survey to complete the pattern
      navigate(`/progress/${patternId}/survey`);
    } catch (error) {
      console.error('Error submitting form:', error);
      notificationsActions.push({
        options: {
          variant: 'error',
        },
        message: 'Exercise could not be completed',
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

  if (patternLoading || exerciseLoading || startupExerciseLoading) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (patternError || exerciseError || startupExerciseError) {
    console.error('Error loading exercise:', patternError || exerciseError || startupExerciseError);
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
          Error loading exercise
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!pattern || !exercise) {
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
        <Typography variant="h6">Exercise not found</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title={pattern.name} />
      <FullSizeCenteredFlexBox>
        <Box sx={{ width: '100%', maxWidth: 600, mt: 4, px: 2 }}>
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
                  disabled={patternLoading || exerciseLoading || isSubmitting}
                  sx={{ mt: 2 }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : startupExercise ? (
                    'Update your learnings'
                  ) : (
                    'Share your learnings'
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Exercise;
