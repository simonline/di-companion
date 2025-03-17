import React, { useState } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Link, Alert, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/sections/Header';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>,
  ): Promise<void> => {
    try {
      await login(values.email, values.password);
      // Redirect to the page the user was trying to access
      navigate(from, { replace: true });
    } catch (err) {
      const error = err as Error;
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  return (
    <>
      <Meta title="Login" />
      <Header title="Login" />
      <FullSizeCenteredFlexBox>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

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
              />

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                sx={{ mt: 3, mb: 2 }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  sx={{ mb: 1, display: 'block' }}
                >
                  Forgot password?
                </Link>
                <Link component="button" variant="body2" onClick={() => navigate('/signup')}>
                  Don&apos;t have an account? Sign Up
                </Link>
              </Box>
            </Form>
          )}
        </Formik>
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Login;
