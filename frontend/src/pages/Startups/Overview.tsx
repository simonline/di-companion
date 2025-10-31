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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Startup } from '@/types/database';
import { supabaseGetRequests, supabaseGetAvailableStartups, supabaseUpdateStartup, supabase } from '@/lib/supabase';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import useNotifications from '@/store/notifications';

export default function OverviewView() {
  const { user } = useAuthContext();
  const [, notificationsActions] = useNotifications();
  const [requests, setRequests] = useState<any[]>([]);
  const [availableStartups, setAvailableStartups] = useState<Startup[]>([]);
  const [coachees, setCoachees] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<string>('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStartupForMenu, setSelectedStartupForMenu] = useState<Startup | null>(null);
  const { fetchStartupPatterns, startupPatterns } = useStartupPatterns();

  // Get count of coachees
  const coacheesCount = coachees.length;

  // Calculate average progress score from scores record
  const calculateAverageScore = () => {
    if (coachees.length === 0) return 0;

    const totalScore = coachees.reduce((sum: number, startup: any) => {
      // Calculate an average from the scores object if it exists
      if (startup.scores) {
        const scoresValues = Object.values(startup.scores as any) as number[];
        const avgScore =
          scoresValues.length > 0
            ? Math.round(scoresValues.reduce((a: number, b: number) => a + b, 0) / scoresValues.length)
            : 0;
        return sum + avgScore;
      }
      return sum;
    }, 0);

    return Math.round(totalScore / coachees.length);
  };

  const averageScore = calculateAverageScore();

  // Fetch coachees when user is available
  useEffect(() => {
    const fetchCoachees = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('coach_id', user.id);

        if (error) {
          console.error('Error fetching coachees:', error);
        } else {
          setCoachees((data || []) as any);
        }
      } catch (error) {
        console.error('Error fetching coachees:', error);
      }
    };

    fetchCoachees();
  }, [user?.id]);

  // Get requests and available startups
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get requests for all startups (we'll filter them in the UI)
        const [requestsData, startupsData] = await Promise.all([
          supabaseGetRequests(), // Get all requests, will filter by startup in UI
          supabaseGetAvailableStartups(),
        ]);
        console.log('requestsData', requestsData);
        setRequests(requestsData || []);
        setAvailableStartups(startupsData || []);

        // Fetch patterns for each startup  
        if (coachees.length > 0) {
          coachees.forEach((startup: any) => {
            if (startup.id) {
              fetchStartupPatterns(startup.id);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user?.id, fetchStartupPatterns]);

  // Count unread requests
  const unreadRequestsCount = requests.filter((req) => !req.read_at).length;

  // Helper function to get last activity date
  const getLastActivityDate = (startup: Startup): string => {
    if (!startupPatterns) return 'No activity yet';

    const startupPatternsForStartup = startupPatterns.filter(
      (pattern) => pattern.startup_id === startup.id
    );

    if (startupPatternsForStartup.length === 0) return 'No activity yet';

    const latestPattern = startupPatternsForStartup.reduce((latest, current) => {
      return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
    });

    return `${formatDistanceToNow(new Date(latestPattern.created_at), { addSuffix: true })}`;
  };

  const handleAssignStartup = async (startupId: string) => {
    if (!startupId || !user?.id) return;

    try {
      // Update the startup with the coach_id
      await supabaseUpdateStartup({
        id: startupId,
        coach_id: user.id,
      });

      // Update local state
      const startupToAssign = availableStartups.find(
        (startup) => startup.id === startupId,
      );
      if (startupToAssign) {
        setCoachees([...coachees, startupToAssign]);
        setAvailableStartups(availableStartups.filter(s => s.id !== startupId));
      }

      setSelectedStartup('');
      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Startup assigned successfully',
      });
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: `Error: ${(error as Error).message}`,
      });
    }
  };

  const handleUnassignStartup = async (startupId: string) => {
    try {
      // Remove the coach_id from the startup
      await supabaseUpdateStartup({
        id: startupId,
        coach_id: null,
      });

      // Update local state
      setCoachees(coachees.filter((startup) => startup.id !== startupId));

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Startup unassigned successfully',
      });
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: `Error: ${(error as Error).message}`,
      });
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, startup: Startup) => {
    event.preventDefault(); // Prevent navigation
    setMenuAnchorEl(event.currentTarget);
    setSelectedStartupForMenu(startup);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedStartupForMenu(null);
  };

  const handleUnassignFromMenu = () => {
    if (selectedStartupForMenu) {
      handleUnassignStartup(selectedStartupForMenu.id);
      handleMenuClose();
    }
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
            action={
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="assign-startup-label">Assign Startup</InputLabel>
                <Select
                  labelId="assign-startup-label"
                  value={selectedStartup}
                  onChange={(e) => {
                    setSelectedStartup(e.target.value);
                    if (e.target.value) {
                      handleAssignStartup(e.target.value);
                    }
                  }}
                  label="Assign Startup"
                  startAdornment={<AddIcon sx={{ ml: 1, mr: -0.5, color: 'action.active' }} />}
                >
                  {availableStartups.length > 0 ? (
                    availableStartups.map((startup) => (
                      <MenuItem key={startup.id} value={startup.id}>
                        {startup.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No unassigned startups
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            }
          />
          <CardContent>
            <List sx={{ width: '100%' }}>
              {coachees.length > 0 &&
                coachees.map((startup: any, index: number, array: any[]) => {
                  // Count unread requests for this startup
                  const startupRequests = requests.filter(
                    (r) => r.startup_id === startup.id && !r.read_at,
                  ).length;

                  return (
                    <React.Fragment key={startup.id || index}>
                      <ListItem
                        component={Link}
                        to={`/startups/${startup.id || startup.name?.toLowerCase()}`}
                        secondaryAction={
                          <IconButton edge="end" onClick={(e) => handleMenuClick(e, startup)}>
                            <MoreVertIcon />
                          </IconButton>
                        }
                        sx={{
                          py: 2,
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
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
                                  Performance Score: {startup.score || 0}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {startupRequests > 0 ? (
                                  <Chip
                                    label={`${startupRequests} Request${startupRequests !== 1 ? 's' : ''
                                      }`}
                                    color="primary"
                                    size="small"
                                    sx={{ color: '#fff' }}
                                  />
                                ) : (
                                  <Chip label="0 Requests" variant="outlined" size="small" />
                                )}
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="body2">Last Activity: {getLastActivityDate(startup)}</Typography>
                                </Box>
                              </Box>
                            </Box>
                          }
                          secondary={
                            <LinearProgress
                              variant="determinate"
                              value={startup.score || 0}
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
              {coachees.length === 0 && (
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


        {/* Menu for startup actions */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.preventDefault()} // Prevent navigation when clicking menu items
        >
          <MenuItem onClick={handleUnassignFromMenu}>Unassign Startup</MenuItem>
        </Menu>
      </CenteredFlexBox>
    </>
  );
}
