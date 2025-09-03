import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Avatar,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { getRecommendationIcon } from './types';
import { Profile, Recommendation, RequestCreate } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useRecommendations from '@/hooks/useRecommendations';
import useRequests from '@/hooks/useRequests';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import RequestForm from './components/RequestForm';
import { getAvatarUrl, supabaseGetProfileById } from '@/lib/supabase';

export const Coach: React.FC = () => {
  const navigate = useNavigate();
  const { startup, profile } = useAuthContext();
  const { fetchRecommendations, updateRecommendation, recommendations, loading, error } =
    useRecommendations();
  const { createRequest } = useRequests();
  const [coach, setCoach] = useState<Profile | null>(null);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    const fetchCoach = async () => {
      if (startup?.coach_id) {
        setCoach(await supabaseGetProfileById(startup.coach_id));
      }
    };

    fetchCoach();
  }, [startup]);

  useEffect(() => {
    if (startup) {
      fetchRecommendations(startup.id);
    }
  }, [fetchRecommendations, startup]);

  // Redirect to Startups view if user is a coach
  if (profile?.is_coach) {
    return <Navigate to="/startups" replace />;
  }

  const handleOpenRequestForm = () => {
    setIsRequestFormOpen(true);
  };

  const handleCloseRequestForm = () => {
    setIsRequestFormOpen(false);
  };

  const handleSubmitRequest = async (values: RequestCreate) => {
    setIsSubmittingRequest(true);

    try {
      await createRequest(values);
      setIsRequestFormOpen(false);
      setNotification({
        message: 'Request sent successfully',
        severity: 'success',
      });
    } catch (error) {
      setNotification({
        message: `Error: ${(error as Error).message}`,
        severity: 'error',
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleRecommendationClick = (recommendation: Recommendation) => {
    // Mark recommendation as read
    if (!recommendation.read_at) {
      updateRecommendation({
        id: recommendation.id,
        read_at: new Date().toISOString(),
      });
    }

    if (recommendation.patterns && recommendation.patterns.length > 0) {
      navigate(`/explore/${recommendation.patterns[0].id}`);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
        }}
      >
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error loading patterns
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!coach) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
        }}
      >
        <Typography variant="h6">No coach assigned yet.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title="Coach" />
      <CenteredFlexBox>
        {/* Coach Hero Section */}
        {coach && (
          <Box
            sx={{
              width: '100%',
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={getAvatarUrl(coach.avatar_id) || undefined}
                  sx={{
                    width: 60,
                    height: 60,
                    mr: 2,
                  }}
                >
                  {coach.given_name?.charAt(0)}
                  {coach.family_name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem', letterSpacing: 1 }}
                  >
                    YOUR COACH
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {coach.given_name} {coach.family_name}
                  </Typography>
                  {coach.position && (
                    <Typography variant="body2" color="text.secondary">
                      {coach.position}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={
                    <Box
                      component="svg"
                      sx={{ width: 20, height: 20 }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </Box>
                  }
                  href={`mailto:${coach.user?.email}`}
                  sx={{
                    textTransform: 'none',
                    boxShadow: 0,
                    color: 'background.paper',
                    '&:hover': {
                      boxShadow: 1,
                    },
                  }}
                >
                  Email
                </Button>

                {coach.is_phone_visible && coach.phone && (
                  <Button
                    variant="outlined"
                    startIcon={
                      <Box
                        component="svg"
                        sx={{ width: 20, height: 20 }}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                      </Box>
                    }
                    href={`tel:${coach.phone}`}
                    sx={{
                      textTransform: 'none',
                    }}
                  >
                    Call
                  </Button>
                )}

                <Button
                  variant="outlined"
                  onClick={handleOpenRequestForm}
                  startIcon={
                    <Box
                      component="svg"
                      sx={{ width: 20, height: 20 }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                    </Box>
                  }
                  sx={{
                    textTransform: 'none',
                  }}
                >
                  Send Request
                </Button>
              </Box>
            </Box>
          </Box>
        )}
        <Divider sx={{ width: '100%', mb: 2 }} />

        {recommendations && recommendations.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recommendations from Your Coach
            </Typography>

            <Box sx={{ width: '100%', mb: 2 }}>
              {recommendations
                .slice()
                .sort(
                  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                )
                .map((recommendation) => (
                  <Box
                    key={recommendation.id}
                    onClick={() => handleRecommendationClick(recommendation)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: recommendation.read_at ? '1px solid' : '2px solid',
                      borderColor: recommendation.read_at ? 'divider' : 'primary.main',
                      mb: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2.5,
                        backgroundColor: 'background.paper',
                      }}
                    >
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{
                          color: 'primary.main',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'flex-start',
                          pt: 0.25
                        }}>
                          {getRecommendationIcon(recommendation.type)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: recommendation.read_at ? 'normal' : 'medium',
                                lineHeight: 1.4,
                                flex: 1,
                                pr: 2,
                              }}
                            >
                              {recommendation.comment}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                whiteSpace: 'nowrap',
                                alignSelf: 'flex-start',
                                mt: 0.3,
                              }}
                            >
                              {format(new Date(recommendation.created_at), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>

                          {recommendation.patterns && recommendation.patterns.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {recommendation.patterns.map((pattern) => (
                                <Typography
                                  key={pattern.id}
                                  variant="body2"
                                  sx={{
                                    backgroundColor: 'action.hover',
                                    borderRadius: 1,
                                    px: 1,
                                    py: 0.5,
                                    color: 'text.secondary',
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  {pattern.name}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
            </Box>
          </>
        )}

        {/* Request Form Dialog */}
        <RequestForm
          open={isRequestFormOpen}
          onClose={handleCloseRequestForm}
          onSubmit={handleSubmitRequest}
          isSubmitting={isSubmittingRequest}
          startupId={startup?.id}
        />

        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification?.severity || 'info'}
            sx={{ width: '100%' }}
          >
            {notification?.message || ''}
          </Alert>
        </Snackbar>
      </CenteredFlexBox>
    </>
  );
};

export default Coach;
