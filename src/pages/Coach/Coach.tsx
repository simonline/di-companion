import React, { useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import { getRecommendationIcon } from './types';
// import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useRecommendations from '@/hooks/useRecommendations';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';

export const Coach: React.FC = () => {
  // const navigate = useNavigate();
  const { startup } = useAuth();
  const coach = startup?.coach;
  const { fetchRecommendations, recommendations, loading, error } = useRecommendations();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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

  if (!recommendations?.length) {
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
        <Typography variant="h6">No patterns available</Typography>
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
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
            }}
          >
            <Avatar
              src={coach.avatar?.url}
              sx={{
                width: { xs: 90, sm: 100 },
                height: { xs: 90, sm: 100 },
                mr: { xs: 0, sm: 4 },
                mb: { xs: 3, sm: 0 },
              }}
            >
              {coach.givenName.charAt(0)}
              {coach.familyName.charAt(0)}
            </Avatar>
            <Box
              sx={{
                flex: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
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

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mt: { xs: 2, sm: 0 },
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
                      }}
                    >
                      Call
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
        <Divider sx={{ width: '100%', mb: 2 }} />

        <List sx={{ width: '100%' }}>
          {recommendations.map((recommendation) => (
            <ListItem
              key={recommendation.documentId}
              // onClick={() => navigate(`/coach/${recommendation.documentId}`)}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f5f5f5 !important',
                },
                bgcolor: recommendation.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <ListItemIcon>{getRecommendationIcon(recommendation.type)}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{ fontWeight: recommendation.isRead ? 'normal' : 'bold' }}
                  >
                    {recommendation.recommendation}
                  </Typography>
                }
              />
              <Typography variant="body2" color="text.secondary">
                {format(new Date(recommendation.publishedAt), 'MMM dd, yyyy')}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CenteredFlexBox>
    </>
  );
};

export default Coach;
