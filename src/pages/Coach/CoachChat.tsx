import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  IconButton,
  TextField,
  Box,
  Avatar,
  InputAdornment,
} from '@mui/material';
import { Send, AttachFile, CameraAlt } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import useRecommendations from '@/hooks/useRecommendations';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';

export const CoachChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const { id } = useParams();

  const { fetchRecommendations, recommendations, loading, error } = useRecommendations();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (!id) return null;

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

  const recommendation = recommendations.find((r) => r.documentId === id);
  if (!recommendation) return null;

  return (
    <>
      <Header title="Coach Chat" />
      <CenteredFlexBox sx={{ height: '100%' }}>
        {/* Chat content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar sx={{ mr: 1 }}>C</Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ ml: 1 }}>
                Coach
              </Typography>
              <Box
                sx={{
                  backgroundColor: '#e3f2fd',
                  borderRadius: '18px',
                  borderTopLeftRadius: '4px',
                  padding: '10px 16px',
                  maxWidth: '80%',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-8px',
                    width: 0,
                    height: 0,
                    borderTop: '8px solid #e3f2fd',
                    borderLeft: '8px solid transparent',
                  },
                }}
              >
                <Typography variant="body1">{recommendation.recommendation}</Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1, mt: 0.5, display: 'block' }}
              >
                {format(new Date(recommendation.publishedAt), 'MMM dd, yyyy hh:mm')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Message input */}
        <Box sx={{ width: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton size="small">
                    <AttachFile />
                  </IconButton>
                  <IconButton size="small">
                    <CameraAlt />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary">
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </CenteredFlexBox>
    </>
  );
};

export default CoachChat;
