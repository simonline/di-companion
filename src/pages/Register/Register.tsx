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
  FormHelperText,
  Avatar,
} from '@mui/material';
import Meta from '@/components/Meta';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Must be at least 8 characters').required('Required'),
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

function Register() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, setErrors }: FormikHelpers<RegisterFormValues>,
  ): Promise<void> => {
    setIsSubmitting(true);
    try {
      const result = await register({
        username: values.email,
        email: values.email,
        password: values.password,
        givenName: values.givenName,
        familyName: values.familyName,
        gender: values.gender,
        position: values.position,
        bio: values.bio,
        linkedinProfile: values.linkedinProfile,
        avatar: values.avatar,
      });

      // Store user data
      localStorage.setItem('user', JSON.stringify(result));

      // Navigate based on user selection
      navigate('/dashboard');
    } catch (err) {
      const error = err as Error;
      console.error('Registration error:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
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
      <Header>
        <Meta title="Create Your Account" />
        <Container maxWidth="md">
          <Box sx={{ py: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: 'bold', mb: 3 }}
            >
              Create Your Account
            </Typography>
            <Typography variant="body1" color="textSecondary" align="center" sx={{ mb: 4 }}>
              Join our platform to get personalized guidance and support for your startup journey.
            </Typography>
          </Box>
        </Container>
      </Header>

      <Container maxWidth="md" sx={{ mb: 8 }}>
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
                      Professional Information
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
                        <Field
                          as={TextField}
                          fullWidth
                          name="position"
                          label="Position"
                          placeholder="e.g., CTO, Product Manager, UX Designer"
                          error={touched.position && errors.position}
                          helperText={touched.position && errors.position}
                        />
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
                          helperText={touched.bio && errors.bio}
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
