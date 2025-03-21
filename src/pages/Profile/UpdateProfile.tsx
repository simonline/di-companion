import { useState } from 'react';
import { Form, Formik, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  useTheme,
  Card,
  CardContent,
  Container,
  LinearProgress,
  Grid,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/sections/Header';

interface UpdateProfileFormValues {
  email: string;
  givenName: string;
  familyName: string;
  gender: string;
  position: string;
  bio: string;
  linkedinProfile: string;
  submit?: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  givenName: Yup.string().required('Required'),
  familyName: Yup.string().required('Required'),
  gender: Yup.string(),
  position: Yup.string(),
  bio: Yup.string(),
  linkedinProfile: Yup.string().url('Must be a valid URL'),
});

// Gender options
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' },
];

function UpdateProfile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { field } = useParams<{ field?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if user is not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  // Get the field to edit or default to all fields
  const isFieldSpecific = !!field;

  // Initialize form values from user data
  const initialValues: UpdateProfileFormValues = {
    email: user.email || '',
    givenName: user.givenName || '',
    familyName: user.familyName || '',
    gender: user.gender || '',
    position: user.position || '',
    bio: user.bio || '',
    linkedinProfile: user.linkedinProfile || '',
  };

  const handleSubmit = async (
    values: UpdateProfileFormValues,
    { setSubmitting, setErrors }: FormikHelpers<UpdateProfileFormValues>,
  ): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // If we're only updating a specific field, only include that field in the update
      const updateData =
        isFieldSpecific && field
          ? {
              id: user.id,
              documentId: user.documentId,
              [field]: values[field as keyof UpdateProfileFormValues],
            }
          : {
              id: user.id,
              documentId: user.documentId,
              email: values.email,
              givenName: values.givenName,
              familyName: values.familyName,
              gender: values.gender,
              position: values.position,
              bio: values.bio,
              linkedinProfile: values.linkedinProfile,
            };

      // Call the API to update the user
      await updateUser(updateData);

      setSuccessMessage('Profile updated successfully');

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      const error = err as Error;
      console.error('Profile update error:', error);
      setErrorMessage(error.message);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // For field-specific editing, create a filtered schema and render only that field
  const getFieldSchema = () => {
    if (!field) return validationSchema;

    const fieldMap: Record<string, Yup.AnySchema> = {
      email: Yup.string().email('Invalid email').required('Required'),
      givenName: Yup.string().required('Required'),
      familyName: Yup.string().required('Required'),
      gender: Yup.string(),
      position: Yup.string(),
      bio: Yup.string(),
      linkedinProfile: Yup.string().url('Must be a valid URL'),
    };

    return Yup.object().shape({
      [field]: fieldMap[field as keyof typeof fieldMap] || Yup.string(),
    });
  };

  const renderFormField = (fieldName: keyof UpdateProfileFormValues, label: string) => {
    // Only render the specific field if in field-specific mode
    if (isFieldSpecific && field !== fieldName) return null;

    if (fieldName === 'gender') {
      return (
        <Grid item xs={12} sm={isFieldSpecific ? 12 : 6}>
          <FormControl fullWidth>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Field as={Select} labelId="gender-label" name="gender" label="Gender">
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field>
          </FormControl>
        </Grid>
      );
    }

    if (fieldName === 'bio') {
      return (
        <Grid item xs={12}>
          <Field
            as={TextField}
            fullWidth
            name="bio"
            label="Background"
            placeholder="Share your educational background, previous work experience, and relevant skills"
            multiline
            rows={3}
          />
        </Grid>
      );
    }

    return (
      <Grid item xs={12} sm={isFieldSpecific ? 12 : fieldName === 'linkedinProfile' ? 12 : 6}>
        <Field as={TextField} fullWidth name={fieldName} label={label} />
      </Grid>
    );
  };

  return (
    <>
      <Header title={isFieldSpecific ? `Edit ${field}` : 'Update Profile'} />
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={getFieldSchema()}
              onSubmit={handleSubmit}
            >
              {({ isValid }) => (
                <Form>
                  <Box sx={{ px: 2, py: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                      {isFieldSpecific ? `Update ${field}` : 'Personal Information'}
                    </Typography>

                    <Grid container spacing={3}>
                      {renderFormField('givenName', 'First Name')}
                      {renderFormField('familyName', 'Last Name')}
                      {renderFormField('email', 'Email')}
                    </Grid>

                    {!isFieldSpecific && <Divider sx={{ my: 4 }} />}

                    {!isFieldSpecific && (
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                        Professional Information
                      </Typography>
                    )}

                    <Grid container spacing={3}>
                      {renderFormField('gender', 'Gender')}
                      {renderFormField('position', 'Position')}
                      {renderFormField('bio', 'Background')}
                      {renderFormField('linkedinProfile', 'LinkedIn Profile URL')}
                    </Grid>
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
                    <Button variant="outlined" onClick={() => navigate('/profile')}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={!isValid || isSubmitting}
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
                      Save Changes
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Container>

      {/* Success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error message */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default UpdateProfile;
