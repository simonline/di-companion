import React, { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Link, Typography, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Header from '@/sections/Header';
import useNotifications from '@/store/notifications';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface LoginFormValues {
  email: string;
  captchaToken?: string;
}

interface OtpFormValues {
  otp: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  captchaToken: Yup.string().required('Please complete the captcha verification'),
});

const OtpSchema = Yup.object().shape({
  otp: Yup.string().matches(/^\d{6}$/, 'OTP must be 6 digits').required('OTP is required'),
});

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuthContext();
  const [, { push }] = useNotifications();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const captchaRef = useRef<HCaptcha>(null);

  // Parse query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl');
  const emailHint = searchParams.get('email');

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting, setErrors }: FormikHelpers<LoginFormValues>,
  ): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          shouldCreateUser: false, // Don't create new users
          captchaToken: values.captchaToken,
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
      // Reset captcha on error
      captchaRef.current?.resetCaptcha();
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

      // Navigate to returnUrl or user page
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl), { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
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

  const handleResendOtp = (): void => {
    // Reset to send code form with email pre-filled
    setEmailSent(false);
    push({
      message: 'Please complete the captcha to resend the code.',
      options: { variant: 'info' }
    });
  };

  const initialValues: LoginFormValues = {
    email: emailHint ? decodeURIComponent(emailHint) : '',
    captchaToken: '',
  };

  if (emailSent) {
    return (
      <>
        <Meta title="Enter OTP Code" />
        <Header title="Enter OTP Code" />
        <FullSizeCenteredFlexBox>
          <Box sx={{ maxWidth: 400, width: '100%', p: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              We&apos;ve sent a 6-digit code to {email}
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
                    InputLabelProps={{
                      sx: {
                        '&:not(.MuiInputLabel-shrink)': {
                          transform: 'translate(14px, 20px) scale(1)'
                        }
                      }
                    }}
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
            {({ errors, touched, isSubmitting, isValid, values, setFieldValue }) => (
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
                      // Don't set touched on error to avoid showing validation error
                    }}
                  />
                </Box>
                {touched.captchaToken && errors.captchaToken && (
                  <Typography variant="caption" color="error" display="block" align="center" sx={{ mb: 2 }}>
                    {errors.captchaToken}
                  </Typography>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isSubmitting ? 'Sending code...' : 'Send Login Code'}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Link 
                    component="button" 
                    variant="body2" 
                    onClick={() => {
                      // Use the email from form values if available, otherwise emailHint
                      const emailToPass = values.email || emailHint || '';
                      const signupUrl = returnUrl 
                        ? `/signup?returnUrl=${returnUrl}&email=${encodeURIComponent(emailToPass)}`
                        : `/signup?email=${encodeURIComponent(emailToPass)}`;
                      navigate(signupUrl);
                    }}
                  >
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