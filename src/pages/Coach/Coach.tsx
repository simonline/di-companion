import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Typography, Paper } from '@mui/material';
import { getRecommendationIcon, sampleRecommendations } from './types';
import { useNavigate } from 'react-router-dom';

export const Coach: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper elevation={0}>
      <List>
        {sampleRecommendations.map((recommendation) => (
          <ListItem
            key={recommendation.id}
            onClick={() => navigate(`/coach/${recommendation.id}`)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5 !important',
              },
              bgcolor: recommendation.read ? 'transparent' : 'action.hover',
            }}
          >
            <ListItemIcon>{getRecommendationIcon(recommendation.type)}</ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  component="span"
                  variant="body1"
                  sx={{ fontWeight: recommendation.read ? 'normal' : 'bold' }}
                >
                  {recommendation.text.split(' ').map((word, index) => {
                    const link = recommendation.links?.find((l) => l.text === word);
                    return link ? (
                      <React.Fragment key={index}>
                        <Typography
                          component="a"
                          href={link.url}
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {word}
                        </Typography>{' '}
                      </React.Fragment>
                    ) : (
                      word + ' '
                    );
                  })}
                </Typography>
              }
            />
            <Typography variant="body2" color="text.secondary">
              {recommendation.date}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Coach;
