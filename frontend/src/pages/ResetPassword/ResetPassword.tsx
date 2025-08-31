import React, { useState } from 'react';
import { Formik, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Alert, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import { supabaseForgotPassword, supabaseResetPassword } from '@/lib/supabase';

interface ResetPasswordFormValues {
  email: string;
  password?: string;
  confirmPassword?: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isResetMode, setIsResetMode] = useState(false);

  // Check if we're in reset mode (have a code)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    console.log('Reset mode check, code:', code);
    setIsResetMode(!!code);
  }, [location.search]);

  const getValidationSchema = () => {
    if (isResetMode) {
      return Yup.object().shape({
        password: Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords must match')
          .required('Please confirm your password'),
      });
    }
    return Yup.object().shape({
      email: Yup.string().email('Invalid email address').required('Email is required'),
    });
  };

  const handleSubmit = async (
    values: ResetPasswordFormValues,
    { setSubmitting }: FormikHelpers<ResetPasswordFormValues>,
  ): Promise<void> => {
    console.log('handleSubmit called with values:', values);
    try {
      setError('');
      setSuccess('');

      if (isResetMode) {
        // Reset password with code
        const params = new URLSearchParams(location.search);
        const code = params.get('code');

        if (!code) {
          throw new Error('Invalid reset code');
        }

        console.log('Attempting to reset password with code:', code);
        await supabaseResetPassword(
          code,
          values.password!
        );

        setSuccess('Password has been reset successfully. You can now login with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Request password reset
        console.log('Attempting to send reset email to:', values.email);
        await supabaseForgotPassword(values.email);

        setSuccess('If an account exists with this email, you will receive a password reset link.');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Reset password error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues: ResetPasswordFormValues = {
    email: '',
    password: '',
    confirmPassword: '',
  };

  return (
    <>
      <Meta title={isResetMode ? 'Reset Password' : 'Forgot Password'} />
      <Header title={isResetMode ? 'Reset Password' : 'Forgot Password'} />
      <FullSizeCenteredFlexBox>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={getValidationSchema()}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ errors, touched, isSubmitting, handleSubmit, validateForm }) => {
            return (
              <form onSubmit={async (e) => {
                console.log('Form submit event triggered');
                e.preventDefault();
                const validationErrors = await validateForm();
                console.log('Validation errors:', validationErrors);
                if (Object.keys(validationErrors).length === 0) {
                  handleSubmit(e);
                }
              }}>
                {!isResetMode && (
                  <Field
                    as={TextField}
                    fullWidth
                    margin="normal"
                    name="email"
                    label="Email"
                    type="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                )}

                {isResetMode && (
                  <>
                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      name="password"
                      label="New Password"
                      type="password"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />

                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                    />
                  </>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                  onClick={() => console.log('Button clicked')}
                >
                  {isSubmitting
                    ? 'Processing...'
                    : isResetMode
                      ? 'Reset Password'
                      : 'Send Reset Link'}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Typography>
                </Box>
              </form>
            );
          }}
        </Formik>
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default ResetPassword;
