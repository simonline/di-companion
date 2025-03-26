import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
} from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Startup } from '@/types/strapi';
import { strapiGetRequests } from '@/lib/strapi';
import React from 'react';

export default function OverviewView() {
  const { user } = useAuthContext();
  const [requests, setRequests] = useState<any[]>([]);

  // Get count of coachees
  const coacheesCount = user?.coachees?.length || 0;

  // Calculate average progress score from scores record
  const calculateAverageScore = () => {
    if (!user?.coachees || user.coachees.length === 0) return 0;

    const totalScore = user.coachees.reduce((sum, startup) => {
      // Calculate an average from the scores object if it exists
      if (startup.scores) {
        const scoresValues = Object.values(startup.scores);
        const avgScore =
          scoresValues.length > 0
            ? Math.round(scoresValues.reduce((a, b) => a + b, 0) / scoresValues.length)
            : 0;
        return sum + avgScore;
      }
      return sum;
    }, 0);

    return Math.round(totalScore / user.coachees.length);
  };

  const averageScore = calculateAverageScore();

  // Get requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestsData = await strapiGetRequests();
        setRequests(requestsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Count unread requests
  const unreadRequestsCount = requests.filter((req) => !req.readAt).length;

  // Helper function to get startup score
  const getStartupScore = (startup: Startup): number => {
    if (startup.scores) {
      const scoresValues = Object.values(startup.scores);
      return scoresValues.length > 0
        ? Math.round(scoresValues.reduce((a, b) => a + b, 0) / scoresValues.length)
        : 0;
    }
    return 0;
  };

  return (
    <>
      <Header title="Coach" />
      <CenteredFlexBox>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Mentored Startups"
                titleTypographyProps={{ variant: 'subtitle1' }}
                sx={{ pb: 0, textAlign: 'center' }}
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {coacheesCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Actively mentoring
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Average Progress"
                titleTypographyProps={{ variant: 'subtitle1' }}
                sx={{ pb: 0, textAlign: 'center' }}
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {averageScore}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={averageScore}
                  sx={{ height: 8, borderRadius: 4, mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Open Requests"
                titleTypographyProps={{ variant: 'subtitle1' }}
                sx={{ pb: 0, textAlign: 'center' }}
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {unreadRequestsCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unprocessed requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Startup Overview */}
        <Card sx={{ mb: 4, width: '100%' }}>
          <CardHeader
            title="Startup Overview"
            subheader="Progress and status of mentored startups"
            titleTypographyProps={{ variant: 'h6' }}
            subheaderTypographyProps={{ variant: 'body2' }}
          />
          <CardContent>
            <List sx={{ width: '100%' }}>
              {user?.coachees &&
                user.coachees.map((startup, index, array) => {
                  // Count unread requests for this startup
                  const startupRequests = requests.filter(
                    (r) => r.startup?.documentId === startup.documentId && !r.readAt,
                  ).length;

                  // Determine activity level based on requests and score
                  const activityLevel =
                    startupRequests > 2 ? 'High' : startupRequests > 0 ? 'Medium' : 'Low';

                  // Get startup score
                  const score = getStartupScore(startup);

                  return (
                    <React.Fragment key={startup.documentId || index}>
                      <ListItem
                        component={Link}
                        to={`/startups/${startup.documentId || startup.name?.toLowerCase()}`}
                        secondaryAction={
                          <IconButton edge="end">
                            <ChevronRightIcon />
                          </IconButton>
                        }
                        sx={{ py: 2, textDecoration: 'none', color: 'inherit' }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: 'background.paper',
                              color: 'text.primary',
                              fontWeight: 'bold',
                              border: '1px solid #e0e0e0',
                            }}
                          >
                            {startup.name ? startup.name.charAt(0) : '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                pr: 4,
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle1" component="div">
                                  {startup.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Maturity Score: {score}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {startupRequests > 0 ? (
                                  <Chip
                                    label={`${startupRequests} Request${
                                      startupRequests !== 1 ? 's' : ''
                                    }`}
                                    color="primary"
                                    size="small"
                                    sx={{ color: '#fff' }}
                                  />
                                ) : (
                                  <Chip label="0 Requests" variant="outlined" size="small" />
                                )}
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="body2">Activity: {activityLevel}</Typography>
                                </Box>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <LinearProgress
                              variant="determinate"
                              value={score}
                              sx={{ height: 8, borderRadius: 4, mt: 1 }}
                            />
                          }
                        />
                      </ListItem>
                      {index < array.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  );
                })}

              {/* Show a message if no startups */}
              {(!user?.coachees || user.coachees.length === 0) && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body1" align="center">
                        No startups currently being mentored
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </CenteredFlexBox>
    </>
  );
}
