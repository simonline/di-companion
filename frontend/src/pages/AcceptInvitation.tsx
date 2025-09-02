import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Button, Paper, Box, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';
import { supabaseAcceptInvitation, supabaseGetInvitationByToken, supabaseLogout } from '@/lib/supabase';

const AcceptInvitation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: userLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [startupInfo, setStartupInfo] = useState<any>(null);
  const [checkingInvitation, setCheckingInvitation] = useState(false);

  const handleLogout = async () => {
    await supabaseLogout();
    // Refresh the page to re-trigger the invitation flow
    window.location.reload();
  };

  const acceptInvitation = React.useCallback(async () => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    setLoading(true);
    try {
      const result = await supabaseAcceptInvitation(token);
      setStartupInfo(result.startup);
      setSuccess(true);

      // Redirect to startup page after 2 seconds
      setTimeout(() => {
        if (result.startup?.id) {
          navigate(`/startups/${result.startup.id}`);
        } else {
          navigate('/startups');
        }
      }, 2000);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invitationToken = params.get('token');

    if (!invitationToken) {
      setError('Invalid invitation link');
      return;
    }

    setToken(invitationToken);

    // Check invitation details
    const checkInvitation = async () => {
      setCheckingInvitation(true);
      try {
        const invitation = await supabaseGetInvitationByToken(invitationToken);

        // Wait for user loading to complete before making decisions
        if (userLoading) {
          return;
        }

        if (!user) {
          // User is not logged in, redirect to login page with return URL
          const returnUrl = encodeURIComponent(`/accept-invitation?token=${invitationToken}`);
          const emailParam = invitation.email ? `&email=${encodeURIComponent(invitation.email)}` : '';
          navigate(`/login?returnUrl=${returnUrl}${emailParam}`);
        } else {
          // Check if the logged-in user's email matches the invitation email
          if (user.email !== invitation.email) {
            setError(`This invitation was sent to ${invitation.email}. You are currently logged in as ${user.email}. Please log out and log in with the correct account.`);
          } else {
            // User is logged in with correct email, auto-accept the invitation
            acceptInvitation();
          }
        }
      } catch (err) {
        setError('Invalid or expired invitation link');
      } finally {
        setCheckingInvitation(false);
      }
    };

    if (!userLoading) {
      checkInvitation();
    }
  }, [location, user, userLoading, navigate, token, acceptInvitation]);

  return (
    <>
      <Header title="Accept Invitation" />
      <CenteredFlexBox>
        <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
          {userLoading || checkingInvitation ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1">Loading...</Typography>
            </Box>
          ) : loading ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1">Processing invitation...</Typography>
            </Box>
          ) : error ? (
            <>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              {error.includes('You are currently logged in as') ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogout}
                  >
                    Log Out
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/')}
                  >
                    Go to Home
                  </Button>
                </Box>
              ) : (
                <Button variant="contained" fullWidth onClick={() => navigate('/')}>
                  Go to Home
                </Button>
              )}
            </>
          ) : success ? (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Alert severity="success" sx={{ mb: 3 }}>
                You have successfully joined {startupInfo?.name || 'the startup'}!
              </Alert>
              <Typography variant="body1" paragraph>
                You now have access to the startup&apos;s resources and team collaboration tools.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting to your startup page...
              </Typography>
            </Box>
          ) : null}
        </Paper>
      </CenteredFlexBox>
    </>
  );
};

export default AcceptInvitation;