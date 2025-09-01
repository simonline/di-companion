import { useState, useCallback, useEffect } from 'react';
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
  Avatar,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import Header from '@/sections/Header';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { getAvatarUrl } from '@/lib/supabase';

interface UpdateProfileFormValues {
  email: string;
  givenName: string;
  familyName: string;
  gender: string;
  position: string;
  bio: string;
  linkedinProfile: string;
  avatar?: File;
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
  const { user, profile, updateProfile } = useAuthContext();
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

  // Initialize form values from user and profile data
  const initialValues: UpdateProfileFormValues = {
    email: user.email || '',
    givenName: profile?.given_name || '',
    familyName: profile?.family_name || '',
    gender: profile?.gender || '',
    position: profile?.position || '',
    bio: profile?.bio || '',
    linkedinProfile: profile?.linkedin_profile || '',
    avatar: undefined,
  };

  const handleSubmit = async (
    values: UpdateProfileFormValues,
    { setSubmitting, setErrors }: FormikHelpers<UpdateProfileFormValues>,
  ): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // If we're only updating a specific field, only include that field in the update
      const fieldMap: Record<string, string> = {
        givenName: 'given_name',
        familyName: 'family_name',
        linkedinProfile: 'linkedin_profile',
      };

      const updatedData =
        isFieldSpecific && field
          ? {
            id: user.id,
            [fieldMap[field] || field]: values[field as keyof UpdateProfileFormValues],
          }
          : {
            id: user.id,
            given_name: values.givenName,
            family_name: values.familyName,
            gender: values.gender,
            position: values.position,
            bio: values.bio,
            linkedin_profile: values.linkedinProfile,
            avatar: values.avatar,
          };

      // Call the API to update the profile
      await updateProfile(updatedData);

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

  // Avatar upload component
  const AvatarUploadField = ({ form }: { form: any }) => {
    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        // Only use the first file if multiple are uploaded
        if (acceptedFiles.length > 0) {
          form.setFieldValue('avatar', acceptedFiles[0]);
        }
      },
      [form],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      },
      maxFiles: 1,
      multiple: false,
    });

    // Current avatar preview URL
    const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
      const url = profile && profile.avatar_id ? getAvatarUrl(profile.avatar_id) : null;
      return url ?? null;
    });

    // Create a preview when a new file is selected
    const avatarFile = form.values.avatar;
    useEffect(() => {
      if (!avatarFile) return;

      const objectUrl = URL.createObjectURL(avatarFile);
      setPreviewUrl(objectUrl);

      // Cleanup
      return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    const handleRemoveAvatar = (e: React.MouseEvent) => {
      e.stopPropagation();
      form.setFieldValue('avatar', undefined);

      // Reset to existing avatar if available
      setPreviewUrl(profile && profile.avatar_id ? getAvatarUrl(profile.avatar_id) : null);
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Box
          {...getRootProps()}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <Avatar
            src={previewUrl || undefined}
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              border: isDragActive ? '2px dashed primary.main' : '2px dashed transparent',
              bgcolor: 'grey.200',
            }}
          >
            {!previewUrl && <CloudUploadIcon sx={{ fontSize: 40 }} />}
          </Avatar>
          <Typography variant="body2" color="text.secondary" align="center">
            {isDragActive ? 'Drop avatar here' : 'Click or drag to upload avatar'}
          </Typography>
        </Box>
        {avatarFile && (
          <Button size="small" color="error" onClick={handleRemoveAvatar}>
            Remove
          </Button>
        )}
      </Box>
    );
  };

  return (
    <>
      <Header title={isFieldSpecific ? `Edit ${field}` : 'Update Profile'} />
      <Container maxWidth="md" sx={{ my: 8 }}>
        <Box sx={{ mb: 1 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/user')}
            sx={{ color: 'text.secondary' }}
          >
            Back to User
          </Button>
        </Box>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={getFieldSchema()}
              onSubmit={handleSubmit}
            >
              {({ isValid, ...formProps }) => (
                <Form>
                  <Box sx={{ px: 2, py: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                      {isFieldSpecific ? `Update ${field}` : 'Personal Information'}
                    </Typography>

                    {/* Avatar upload field - only show if editing all fields or specifically avatar */}
                    {(!isFieldSpecific || field === 'avatar') && (
                      <AvatarUploadField form={formProps} />
                    )}

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
