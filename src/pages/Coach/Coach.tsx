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
} from '@mui/material';
import { getRecommendationIcon } from './types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useRecommendations from '@/hooks/useRecommendations';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';

export const Coach: React.FC = () => {
  const navigate = useNavigate();
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
        <List sx={{ width: '100%' }}>
          {recommendations.map((recommendation) => (
            <ListItem
              key={recommendation.documentId}
              onClick={() => navigate(`/coach/${recommendation.documentId}`)}
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
