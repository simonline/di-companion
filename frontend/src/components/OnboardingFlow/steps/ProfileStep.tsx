import React, { useState, useCallback, useEffect } from 'react';
import { Form, Formik, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Typography,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuthContext } from '@/hooks/useAuth';
import { OnboardingStepProps } from '../OnboardingFlow';
import { getAvatarUrl } from '@/lib/supabase';
import { FileRecord, ProfileUpdate } from '@/types/database';

interface ProfileFormValues {
  email: string;
  givenName: string;
  familyName: string;
  gender: string;
  position: string;
  bio: string;
  linkedinProfile: string;
  avatar?: File;
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

const ProfileStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}) => {
  const { user, profile, updateProfile } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!user || !profile) return null;

  // Initialize form values from user and profile data
  const initialValues: ProfileFormValues = {
    email: user.email || '',
    givenName: profile.given_name || '',
    familyName: profile.family_name || '',
    gender: profile.gender || '',
    position: profile.position || '',
    bio: profile.bio || '',
    linkedinProfile: profile.linkedin_profile || '',
    avatar: undefined,
  };

  const handleSubmit = async (values: ProfileFormValues): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Update the profile
      await updateProfile({
        id: profile.id,
        given_name: values.givenName,
        family_name: values.familyName,
        gender: values.gender,
        position: values.position,
        bio: values.bio,
        linkedin_profile: values.linkedinProfile,
        ...(values.avatar ? { avatar: values.avatar } : {})
      } as ProfileUpdate & { avatar?: File });

      // Move to next step
      onNext();
    } catch (err) {
      const error = err as Error;
      console.error('Profile update error:', error);
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Avatar upload component
  const AvatarUploadField = ({ form }: { form: any }) => {
    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
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

    const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
      return getAvatarUrl(profile.avatar_id) || null;
    });

    const avatarFile = form.values.avatar;
    useEffect(() => {
      if (!avatarFile) return;

      const objectUrl = URL.createObjectURL(avatarFile);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    const handleRemoveAvatar = (e: React.MouseEvent) => {
      e.stopPropagation();
      form.setFieldValue('avatar', undefined);
      setPreviewUrl(getAvatarUrl(profile.avatar_id) || null);
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
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isValid, ...formProps }) => (
        <Form>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Error Message */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            {/* Avatar Upload */}
            <AvatarUploadField form={formProps} />

            {/* Personal Information */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
              Personal Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="givenName"
                  label="First Name"
                  error={touched.givenName && Boolean(errors.givenName)}
                  helperText={touched.givenName && errors.givenName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="familyName"
                  label="Last Name"
                  error={touched.familyName && Boolean(errors.familyName)}
                  helperText={touched.familyName && errors.familyName}
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="position"
                  label="Position"
                  placeholder="e.g., Product Manager, Entrepreneur"
                />
              </Grid>
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
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  name="linkedinProfile"
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/in/yourprofile"
                  error={touched.linkedinProfile && Boolean(errors.linkedinProfile)}
                  helperText={touched.linkedinProfile && errors.linkedinProfile}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={onBack}
                disabled={isFirstStep || isSubmitting}
                sx={{ px: 4 }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || isSubmitting}
                sx={{ px: 4 }}
              >
                {isSubmitting ? 'Saving...' : isLastStep ? 'Complete' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default ProfileStep;