import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Link, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Header from '@/sections/Header';
import useNotifications from '@/store/notifications';

interface LoginFormValues {
  email: string;
}

interface OtpFormValues {
  otp: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const OtpSchema = Yup.object().shape({
  otp: Yup.string().matches(/^\d{6}$/, 'OTP must be 6 digits').required('OTP is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthContext();
  const [, { push }] = useNotifications();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      navigate(profile.is_coach ? '/startups' : '/user', { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setErrors }: FormikHelpers<LoginFormValues>,
  ): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false, // Don't create new users
        },
      });

      if (error) throw error;

      setEmail(values.email);
      setEmailSent(true);
      push({
        message: 'OTP code sent! Check your email.',
        options: { variant: 'success' }
      });
    } catch (err) {
      const error = err as Error;
      console.error('Login error:', error);
      setErrors({ email: error.message });
      push({
        message: error.message,
        options: { variant: 'error' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (
    values: OtpFormValues,
    { setSubmitting, setErrors }: FormikHelpers<OtpFormValues>,
  ): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: values.otp,
        type: 'email',
      });

      if (error) throw error;

      // Check if session was established
      if (!data.session) {
        throw new Error('Failed to establish session');
      }

      push({
        message: 'Successfully signed in!',
        options: { variant: 'success' }
      });

      // The auth context will handle the redirect
      navigate('/', { replace: true });
    } catch (err) {
      const error = err as Error;
      console.error('OTP verification error:', error);
      setErrors({ otp: 'Invalid or expired code. Please try again.' });
      push({
        message: error.message || 'Invalid or expired code',
        options: { variant: 'error' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      push({
        message: 'New OTP code sent! Check your email.',
        options: { variant: 'success' }
      });
    } catch (err) {
      const error = err as Error;
      push({
        message: error.message,
        options: { variant: 'error' }
      });
    }
  };

  const initialValues: LoginFormValues = {
    email: '',
  };

  if (emailSent) {
    return (
      <>
        <Meta title="Enter OTP Code" />
        <Header title="Enter OTP Code" />
        <FullSizeCenteredFlexBox>
          <Box sx={{ maxWidth: 400, width: '100%', p: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              We've sent a 6-digit code to {email}
            </Alert>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              Enter the code from your email to sign in. The code will expire in 1 hour.
            </Typography>

            <Formik
              initialValues={{ otp: '' }}
              validationSchema={OtpSchema}
              onSubmit={handleOtpSubmit}
            >
              {({ errors, touched, isSubmitting, values }) => (
                <Form autoComplete="off">
                  <Field
                    as={TextField}
                    fullWidth
                    margin="normal"
                    name="otp"
                    label="6-digit code"
                    type="text"
                    value={values.otp || ''}
                    autoComplete="one-time-code"
                    inputProps={{
                      max_length: 6,
                      pattern: '[0-9]*',
                      inputMode: 'numeric',
                      autoComplete: 'one-time-code',
                      style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem' }
                    }}
                    error={touched.otp && Boolean(errors.otp)}
                    helperText={touched.otp && errors.otp}
                    placeholder="000000"
                    autoFocus
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </Form>
              )}
            </Formik>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Didn&apos;t receive the code?
              </Typography>
              <Button
                variant="text"
                color="primary"
                onClick={handleResendOtp}
                sx={{ mb: 1 }}
              >
                Resend Code
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                (You can request a new code every 60 seconds)
              </Typography>
              <br />
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Try a different email
              </Link>
            </Box>
          </Box>
        </FullSizeCenteredFlexBox>
      </>
    );
  }

  return (
    <>
      <Meta title="Login" />
      <Header title="Login" />
      <FullSizeCenteredFlexBox>
        <Box sx={{ maxWidth: 400, width: '100%' }}>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Log in
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            No password needed! We&apos;ll send you a secure code to sign in.
          </Typography>
          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="email"
                  label="Email"
                  type="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  placeholder="Enter your email address"
                />

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isSubmitting ? 'Sending code...' : 'Send Login Code'}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Link component="button" variant="body2" onClick={() => navigate('/signup')}>
                    Don&apos;t have an account? Sign Up
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Login;