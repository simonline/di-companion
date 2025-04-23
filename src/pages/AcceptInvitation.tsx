import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Button, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';
import { strapiAcceptInvitation } from '@/lib/strapi';

const AcceptInvitation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: userLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invitationToken = params.get('token');

    if (!invitationToken) {
      setError('Invalid invitation link');
      return;
    }

    setToken(invitationToken);

    if (!userLoading && !user) {
      // If user is not logged in, redirect to login page with return URL
      const returnUrl = encodeURIComponent(`/accept-invitation?token=${invitationToken}`);
      navigate(`/login?returnUrl=${returnUrl}`);
    }
  }, [location, user, userLoading, navigate]);

  const acceptInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    setLoading(true);
    try {
      // Call Strapi API to accept invitation
      await strapiAcceptInvitation(token);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Accept Invitation" />
      <CenteredFlexBox>
        <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Button variant="contained" fullWidth onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </>
          ) : success ? (
            <>
              <Alert severity="success" sx={{ mb: 3 }}>
                You have successfully joined the startup!
              </Alert>
              <Typography variant="body1" paragraph>
                You now have access to the startup&apos;s dashboard and resources.
              </Typography>
              <Button variant="contained" fullWidth onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </>
          ) : token ? (
            <>
              <Typography variant="h6" sx={{ mb: 3 }}>
                You have been invited to join a startup
              </Typography>
              <Typography variant="body1" paragraph>
                Click the button below to accept the invitation and gain access to the startup&apos;s dashboard.
              </Typography>
              <Button variant="contained" fullWidth onClick={acceptInvitation}>
                Accept Invitation
              </Button>
            </>
          ) : null}
        </Paper>
      </CenteredFlexBox>
    </>
  );
};

export default AcceptInvitation;
