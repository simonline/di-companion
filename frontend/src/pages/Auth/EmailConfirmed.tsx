import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';
import { supabaseCreateProfile } from '@/lib/supabase';

function EmailConfirmed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuthContext();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check for error in URL params (Supabase adds error params if confirmation fails)
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setMessage(errorDescription || 'Email confirmation failed. Please try again.');
      return;
    }

    // Check if we have a confirmation token type
    const type = searchParams.get('type');

    // Email was successfully confirmed
    setStatus('success');
    setMessage('Your email has been successfully confirmed!');

    // Check if user has a profile
    if (user && !profile) {
      // User exists but no profile - create one automatically
      console.log("IS COACH:", user.user_metadata?.is_coach);
      const profileData = {
        id: user.id,
        is_coach: user.user_metadata?.is_coach || false
      };

      supabaseCreateProfile(profileData).then((createdProfile) => {
        console.log("Created profile:", createdProfile);
        // Navigate based on the created profile's role
        setTimeout(() => {
          console.log("Navigating based on role:", createdProfile.is_coach);
          navigate(createdProfile.is_coach ? '/startups' : '/user');
        }, 2000);
      }).catch((error) => {
        console.error('Failed to create profile:', error);
        // Fall back to user page if profile creation fails
        setTimeout(() => {
          navigate('/user');
        }, 2000);
      });
    } else if (user && profile) {
      console.log("Navigating based on existing profile:", profile);
      // User has a profile - redirect based on role
      setTimeout(() => {
        navigate(profile.is_coach ? '/startups' : '/startup');
      }, 2000);
    }

  }, [searchParams, user, profile, navigate]);

  const handleContinue = () => {
    if (user) {
      navigate(profile?.is_coach ? '/startups' : '/startup');
    } else {
      navigate('/login');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <Header title="Email Confirmation" />

      <Container maxWidth="sm" sx={{ my: 8 }}>
        <Card elevation={3} sx={{ borderRadius: 2, textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            {status === 'loading' && (
              <>
                <CircularProgress size={64} sx={{ mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  Confirming your email...
                </Typography>
              </>
            )}

            {status === 'success' && (
              <>
                <Box sx={{ mb: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
                </Box>

                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Email Confirmed!
                </Typography>

                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    {message}
                  </Typography>
                </Alert>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  {user
                    ? "You're all set! Click continue to proceed to your dashboard."
                    : "You can now log in with your email to access your account."}
                </Typography>

                <Button
                  variant="contained"
                  onClick={handleContinue}
                  fullWidth
                  size="large"
                >
                  {user ? 'Continue to Dashboard' : 'Go to Login'}
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <Box sx={{ mb: 3 }}>
                  <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
                </Box>

                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Confirmation Failed
                </Typography>

                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    {message}
                  </Typography>
                </Alert>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  The confirmation link may have expired or already been used.
                  Please try logging in or request a new confirmation email.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={handleBackToLogin}
                  >
                    Back to Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up Again
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default EmailConfirmed;