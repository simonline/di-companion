import React, { useEffect } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Link, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import Header from '@/sections/Header';
import useNotifications from '@/store/notifications';

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
  const { user, login } = useAuthContext();
  const [showPassword, setShowPassword] = React.useState(false);
  const [, { push }] = useNotifications();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.isCoach ? '/startups' : '/user', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>,
  ): Promise<void> => {
    try {
      await login(values.email, values.password);
      // Navigation will happen automatically via the useEffect
    } catch (err) {
      const error = err as Error;
      console.error('Login error:', error);
      push({
        message: error.message,
        options: { variant: 'error' }
      });
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
                  onClick={() => navigate('/reset-password')}
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
