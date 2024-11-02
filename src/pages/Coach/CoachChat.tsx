import React, { useState } from 'react';
import { Typography, IconButton, TextField, Box, Avatar, InputAdornment } from '@mui/material';
import { Send, AttachFile, CameraAlt } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { sampleRecommendations } from './types';

export const CoachChat: React.FC = () => {
  const [message, setMessage] = useState('');

  const { id } = useParams();
  if (!id) return null;
  const recommendation = sampleRecommendations.find((r) => r.id === id);
  if (!recommendation) return null;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
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
              <Typography variant="body1">{recommendation.text}</Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1, mt: 0.5, display: 'block' }}
            >
              {recommendation.date} 13:30
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Message input */}
      <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
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
    </Box>
  );
};

export default CoachChat;
