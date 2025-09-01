import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';

function ConfirmEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const email = location.state?.email || '';

  // If user is already authenticated (email confirmed), redirect to appropriate page
  useEffect(() => {
    if (user) {
      // Check if user has a startup, if not redirect to create one
      navigate('/startup');
    }
  }, [user, navigate]);

  const handleResendEmail = () => {
    // This could trigger a resend email function if needed
    navigate('/login');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <Header title="Confirm Your Email" />

      <Container maxWidth="sm" sx={{ my: 8 }}>
        <Card elevation={3} sx={{ borderRadius: 2, textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <EmailIcon sx={{ fontSize: 64, color: 'primary.main' }} />
            </Box>

            <Typography variant="h5" gutterBottom fontWeight="bold">
              Check Your Email
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a confirmation email to:
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="medium">
                {email || 'your email address'}
              </Typography>
            </Alert>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Please click the link in the email to verify your account. 
              Once confirmed, you can log in to complete your profile setup.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleResendEmail}
              >
                Resend Email
              </Button>
              <Button
                variant="contained"
                onClick={handleGoToLogin}
              >
                Go to Login
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
              Didn't receive the email? Check your spam folder or try resending.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default ConfirmEmail;