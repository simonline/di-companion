import { useState, useCallback, useEffect } from 'react';
import { Form, Formik, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
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
  FormHelperText,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import Header from '@/sections/Header';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface RegisterFormValues {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
  gender: string;
  position: string;
  bio: string;
  linkedinProfile: string;
  startupId: string;
  createNewStartup: boolean;
  avatar?: File;
  submit?: string;
  phone?: string;
  isPhoneVisible?: boolean;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Must be at least 8 characters').required('Required'),
  givenName: Yup.string().required('Required'),
  familyName: Yup.string().required('Required'),
  gender: Yup.string(),
  position: Yup.string(),
  phone: Yup.string().when('isCoach', {
    is: true,
    then: (schema) => schema.required('Required for coaches'),
  }),
  bio: Yup.string().max(200, 'Must be 200 characters or less'),
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

function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the coach parameter exists in the URL
  const isCoach = new URLSearchParams(location.search).get('coach') !== null;

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, setErrors }: FormikHelpers<RegisterFormValues>,
  ): Promise<void> => {
    setIsSubmitting(true);
    try {
      await register({
        username: uuidv4(),
        email: values.email,
        password: values.password,
        givenName: values.givenName,
        familyName: values.familyName,
        gender: values.gender,
        position: isCoach ? undefined : values.position,
        bio: values.bio,
        linkedinProfile: values.linkedinProfile,
        avatar: values.avatar,
        isCoach: isCoach,
        ...(isCoach && { phone: values.phone, isPhoneVisible: values.isPhoneVisible }),
      });

      // Navigate based on user selection
      navigate('/login');
    } catch (err) {
      const error = err as Error;
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Avatar upload component
  const AvatarUploadField = ({ form }: { form: any }) => {
    const [uploadError, setUploadError] = useState<string | null>(null);

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        // Clear any previous errors
        setUploadError(null);

        // Only use the first file if multiple are uploaded
        if (acceptedFiles.length > 0) {
          const file = acceptedFiles[0];

          // Check file size (5MB limit as example)
          if (file.size > 5 * 1024 * 1024) {
            setUploadError('File too large. Maximum size is 5MB.');
            return;
          }

          // Check file type
          const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
          if (!validTypes.includes(file.type)) {
            setUploadError('Invalid file format. Please upload a JPG, PNG or GIF image.');
            return;
          }

          form.setFieldValue('avatar', file);
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
      maxSize: 5 * 1024 * 1024, // 5MB size limit
      onDropRejected: (rejections) => {
        const rejection = rejections[0];
        if (rejection?.errors[0]?.code === 'file-too-large') {
          setUploadError('File is too large. Maximum size is 5MB.');
        } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
          setUploadError('Invalid file type. Please upload an image file.');
        } else {
          setUploadError('Error uploading file. Please try again.');
        }
      },
    });

    // Create preview for selected avatar
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const avatarFile = form.values.avatar;

    useEffect(() => {
      if (!avatarFile) {
        setPreviewUrl(null);
        return;
      }

      const objectUrl = URL.createObjectURL(avatarFile);
      setPreviewUrl(objectUrl);

      // Clean up the URL when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    const handleRemoveAvatar = (e: React.MouseEvent) => {
      e.stopPropagation();
      form.setFieldValue('avatar', undefined);
      setPreviewUrl(null);
      setUploadError(null);
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
              border: isDragActive
                ? '2px dashed primary.main'
                : uploadError
                  ? '2px dashed #f44336'
                  : '2px dashed transparent',
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
        {uploadError && (
          <Typography variant="body2" color="error" align="center" sx={{ mt: 1 }}>
            {uploadError}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <>
      <Header title={isCoach ? "Create Coach Account" : "Create Your Account"} />

      <Container maxWidth="md" sx={{ my: 8 }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent>
            <Formik
              initialValues={
                {
                  email: '',
                  password: '',
                  givenName: '',
                  familyName: '',
                  gender: '',
                  position: '',
                  bio: '',
                  linkedinProfile: '',
                  startupId: '',
                  createNewStartup: false,
                  avatar: undefined,
                  phone: '',
                  isPhoneVisible: false,
                } as RegisterFormValues
              }
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, ...formProps }) => (
                <Form>
                  <Box sx={{ px: 2, py: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                      Personal Information
                    </Typography>

                    {/* Avatar upload field */}
                    <AvatarUploadField form={formProps} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          name="givenName"
                          label="First Name"
                          error={touched.givenName && errors.givenName}
                          helperText={touched.givenName && errors.givenName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          name="familyName"
                          label="Last Name"
                          error={touched.familyName && errors.familyName}
                          helperText={touched.familyName && errors.familyName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          name="email"
                          label="Email"
                          error={touched.email && errors.email}
                          helperText={touched.email && errors.email}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          name="password"
                          label="Password"
                          type="password"
                          error={touched.password && errors.password}
                          helperText={touched.password && errors.password}
                        />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                      {isCoach ? "Coach Information" : "Professional Information"}
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={touched.gender && Boolean(errors.gender)}>
                          <InputLabel id="gender-label">Gender</InputLabel>
                          <Field as={Select} labelId="gender-label" name="gender" label="Gender">
                            {genderOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Field>
                          {touched.gender && errors.gender && (
                            <FormHelperText>{errors.gender}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {!isCoach && (
                          <Field
                            as={TextField}
                            fullWidth
                            name="position"
                            label="Position"
                            placeholder="e.g., CTO, Product Manager, UX Designer"
                            error={touched.position && errors.position}
                            helperText={touched.position && errors.position}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          name="bio"
                          label="Background"
                          placeholder="Share your educational background, previous work experience, and relevant skills that contribute to your role in the startup"
                          multiline
                          rows={3}
                          error={touched.bio && errors.bio}
                          helperText={
                            (touched.bio && errors.bio) ||
                            `${formProps.values.bio?.length || 0}/200 characters`
                          }
                          inputProps={{ maxLength: 200 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          name="linkedinProfile"
                          label="LinkedIn Profile URL"
                          placeholder="https://www.linkedin.com/in/yourprofile"
                          error={touched.linkedinProfile && errors.linkedinProfile}
                          helperText={touched.linkedinProfile && errors.linkedinProfile}
                        />
                      </Grid>
                      {isCoach && (
                        <>
                          <Grid item xs={12} container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                              <Field
                                as={TextField}
                                fullWidth
                                name="phone"
                                label="Phone Number"
                                placeholder="e.g., +1 234 567 8900"
                                error={touched.phone && errors.phone}
                                helperText={touched.phone && errors.phone}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Field
                                name="isPhoneVisible"
                                type="checkbox"
                                render={({ field }: any) => (
                                  <FormControl fullWidth>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          {...field}
                                          checked={field.value}
                                        />
                                      }
                                      label="Make my phone number visible to startups"
                                    />
                                  </FormControl>
                                )}
                              />
                            </Grid>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      p: 3,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.grey[50],
                    }}
                  >
                    {errors.submit && (
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ mr: 'auto', alignSelf: 'center' }}
                      >
                        {errors.submit}
                      </Typography>
                    )}
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
                      Create Account
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

export default Register;
