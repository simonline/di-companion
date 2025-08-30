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
import { Recommendation } from '@/types/supabase';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useRecommendations from '@/hooks/useRecommendations';
import useRequests from '@/hooks/useRequests';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import RequestForm from './components/RequestForm';
import { CreateRequest } from '@/lib/supabase';

export const Coach: React.FC = () => {
  const navigate = useNavigate();
  const { startup, user } = useAuthContext();
  const coach = startup?.coach;
  const { fetchRecommendations, updateRecommendation, recommendations, loading, error } =
    useRecommendations();
  const { createRequest } = useRequests();

  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    if (startup) {
      fetchRecommendations(startup.documentId);
    }
  }, [fetchRecommendations, startup]);

  // Redirect to Startups view if user is a coach
  if (user?.isCoach) {
    return <Navigate to="/startups" replace />;
  }

  const handleOpenRequestForm = () => {
    setIsRequestFormOpen(true);
  };

  const handleCloseRequestForm = () => {
    setIsRequestFormOpen(false);
  };

  const handleSubmitRequest = async (values: CreateRequest) => {
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
    if (!recommendation.readAt) {
      updateRecommendation({
        documentId: recommendation.documentId,
        readAt: new Date().toISOString(),
      });
    }

    if (recommendation.patterns && recommendation.patterns.length > 0) {
      navigate(`/explore/${recommendation.patterns[0].documentId}`);
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Avatar
                src={coach.avatar?.url}
                sx={{
                  width: 60,
                  height: 60,
                  mr: 2,
                }}
              >
                {coach.givenName.charAt(0)}
                {coach.familyName.charAt(0)}
              </Avatar>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem', letterSpacing: 1 }}
                >
                  YOUR COACH
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {coach.givenName} {coach.familyName}
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
                flexDirection: 'row',
                gap: 1,
                width: '100%',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                size="small"
                disableElevation
                startIcon={
                  <Box
                    component="svg"
                    sx={{ width: 16, height: 16 }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </Box>
                }
                href={`mailto:${coach.email}`}
                sx={{
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  flex: 1,
                  minWidth: '120px',
                }}
              >
                Email
              </Button>

              {coach.isPhoneVisible && coach.phone && (
                <Button
                  variant="contained"
                  size="small"
                  disableElevation
                  startIcon={
                    <Box
                      component="svg"
                      sx={{ width: 16, height: 16 }}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                    </Box>
                  }
                  href={`tel:${coach.phone}`}
                  sx={{
                    textTransform: 'none',
                    px: 2,
                    py: 0.75,
                    flex: 1,
                    minWidth: '120px',
                  }}
                >
                  Call
                </Button>
              )}

              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={handleOpenRequestForm}
                startIcon={
                  <Box
                    component="svg"
                    sx={{ width: 16, height: 16 }}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                  </Box>
                }
                sx={{
                  textTransform: 'none',
                  px: 2,
                  py: 0.75,
                  flex: 1,
                  minWidth: '120px',
                }}
              >
                Send Request
              </Button>
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
                  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
                )
                .map((recommendation) => (
                  <Box
                    key={recommendation.documentId}
                    onClick={() => handleRecommendationClick(recommendation)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      mb: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      },
                      ...(recommendation.readAt ? {} : {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 4,
                          height: '100%',
                          backgroundColor: 'primary.main',
                        }
                      })
                    }}
                  >
                    <Box
                      sx={{
                        p: 2.5,
                        backgroundColor: recommendation.readAt ? 'background.paper' : 'action.hover',
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
                                fontWeight: recommendation.readAt ? 'normal' : 'medium',
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
                              {format(new Date(recommendation.publishedAt), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>

                          {recommendation.patterns && recommendation.patterns.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {recommendation.patterns.map((pattern) => (
                                <Typography
                                  key={pattern.documentId}
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
          startupId={startup?.documentId}
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
