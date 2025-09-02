import { useState, useRef } from 'react';
import { Form, Formik, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  LinearProgress,
  Alert,
  Link,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';
import Header from '@/sections/Header';
import EmailIcon from '@mui/icons-material/Email';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface SignupFormValues {
  email: string;
  acceptPrivacy: boolean;
  captchaToken?: string;
  submit?: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  acceptPrivacy: Yup.boolean()
    .oneOf([true], 'You must accept the privacy policy to continue')
    .required('You must accept the privacy policy'),
  captchaToken: Yup.string()
    .required('Please complete the captcha verification'),
});

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, notificationsActions] = useNotifications();
  const captchaRef = useRef<HCaptcha>(null);

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl');
  const emailHint = searchParams.get('email');

  const handleSubmit = async (
    values: SignupFormValues,
    { setSubmitting, setErrors }: FormikHelpers<SignupFormValues>
  ): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Register with email and captcha token (passwordless)
      await register({
        email: values.email,
        acceptedPrivacyPolicy: values.acceptPrivacy,
        captchaToken: values.captchaToken,
      });

      // Show success notification
      notificationsActions.push({
        options: { variant: 'success', autoHideDuration: 10000 },
        message: `Welcome! Please check your email for a magic link to sign in.`,
      });

      // Navigate to confirmation page with returnUrl if present
      navigate('/register/confirm', { 
        state: { 
          email: values.email,
          returnUrl: returnUrl ? decodeURIComponent(returnUrl) : null
        } 
      });
    } catch (err) {
      const error = err as Error;
      console.error('Registration error:', error);

      // Reset captcha on error
      captchaRef.current?.resetCaptcha();

      // Show error notification
      notificationsActions.push({
        options: { variant: 'error', autoHideDuration: 10000 },
        message: error.message || 'Registration failed. Please try again.',
      });

      // Set form errors
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Create Your Account" />

      <Container maxWidth="sm" sx={{ my: 8 }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Sign Up
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start your innovation journey
              </Typography>
            </Box>

            <Formik
              initialValues={{
                email: emailHint ? decodeURIComponent(emailHint) : '',
                acceptPrivacy: false,
                captchaToken: '',
              } as SignupFormValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, values, setFieldValue }) => (
                <Form>
                  <Box sx={{ mb: 3 }}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="email"
                      label="Email Address"
                      type="email"
                      autoComplete="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      sx={{ mb: 2 }}
                    />

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      We'll send you a magic link to sign in - no password needed!
                    </Typography>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.acceptPrivacy}
                          onChange={(e) => setFieldValue('acceptPrivacy', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the{' '}
                          <Link component={RouterLink} to="/privacy-policy" target="_blank">
                            Privacy Policy
                          </Link>
                        </Typography>
                      }
                    />
                    {touched.acceptPrivacy && errors.acceptPrivacy && (
                      <Typography variant="caption" color="error" display="block" sx={{ mt: 1, mb: 2 }}>
                        {errors.acceptPrivacy}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <HCaptcha
                        ref={captchaRef}
                        sitekey={HCAPTCHA_SITE_KEY}
                        onVerify={(token) => {
                          setFieldValue('captchaToken', token);
                          // Don't mark as touched here - let it happen naturally
                        }}
                        onExpire={() => {
                          setFieldValue('captchaToken', '');
                          // Don't mark as touched here either
                        }}
                        onError={() => {
                          setFieldValue('captchaToken', '');
                          notificationsActions.push({
                            options: { variant: 'error' },
                            message: 'Captcha verification failed. Please try again.',
                          });
                        }}
                      />
                    </Box>
                    {touched.captchaToken && errors.captchaToken && (
                      <Typography variant="caption" color="error" display="block" align="center" sx={{ mb: 2 }}>
                        {errors.captchaToken}
                      </Typography>
                    )}
                  </Box>

                  {errors.submit && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.submit}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={!isValid || isSubmitting}
                    sx={{
                      mb: 2,
                      position: 'relative',
                      '&.Mui-disabled': {
                        backgroundColor: (theme) => theme.palette.action.disabledBackground,
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

                  <Typography variant="body2" align="center" color="text.secondary">
                    Already have an account?{' '}
                    <Link 
                      component={RouterLink} 
                      to={(() => {
                        const emailToPass = values.email || emailHint || '';
                        if (returnUrl) {
                          return `/login?returnUrl=${returnUrl}&email=${encodeURIComponent(emailToPass)}`;
                        } else if (emailToPass) {
                          return `/login?email=${encodeURIComponent(emailToPass)}`;
                        }
                        return '/login';
                      })()} 
                      underline="hover"
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default Signup;