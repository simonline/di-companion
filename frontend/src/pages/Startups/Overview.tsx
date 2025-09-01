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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Menu,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon, Category as CategoryIcon } from '@mui/icons-material';
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
import { CategoryEnum, categoryDisplayNames, categoryColors } from '@/utils/constants';

export default function OverviewView() {
  const { user } = useAuthContext();
  const [requests, setRequests] = useState<any[]>([]);
  const [availableStartups, setAvailableStartups] = useState<Startup[]>([]);
  const [coachees, setCoachees] = useState<Startup[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<string>('');
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStartupForMenu, setSelectedStartupForMenu] = useState<Startup | null>(null);
  const { fetchStartupPatterns, startupPatterns } = useStartupPatterns();

  // State for category assignment dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CategoryEnum[]>([]);

  // State for bulk category assignment
  const [isBulkCategoryDialogOpen, setIsBulkCategoryDialogOpen] = useState(false);
  const [selectedStartups, setSelectedStartups] = useState<Startup[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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

  // Reset selection mode when coachees list changes
  useEffect(() => {
    if (isSelectionMode) {
      setSelectedStartups([]);
    }
  }, [coachees.length, isSelectionMode]);

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

  const handleAssignStartup = async () => {
    if (!selectedStartup || !user?.id) return;

    try {
      // Update the startup with the coach_id
      await supabaseUpdateStartup({
        id: selectedStartup,
        coach_id: user.id,
      });

      // Update local state
      const startupToAssign = availableStartups.find(
        (startup) => startup.id === selectedStartup,
      );
      if (startupToAssign) {
        setCoachees([...coachees, startupToAssign]);
        setAvailableStartups(availableStartups.filter(s => s.id !== selectedStartup));
      }

      setIsAssignDialogOpen(false);
      setSelectedStartup('');
      setNotification({ message: 'Startup assigned successfully', severity: 'success' });
    } catch (error) {
      setNotification({
        message: `Error: ${(error as Error).message}`,
        severity: 'error',
      });
    }
  };

  const handleUnassignStartup = async (startupId: string) => {
    try {
      // Remove the coach_id from the startup
      await supabaseUpdateStartup({
        id: startupId,
        coach_id: undefined,
      });

      // Update local state
      setCoachees(coachees.filter((startup) => startup.id !== startupId));

      setNotification({ message: 'Startup unassigned successfully', severity: 'success' });
    } catch (error) {
      setNotification({
        message: `Error: ${(error as Error).message}`,
        severity: 'error',
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

  // Handle opening the category dialog
  const handleOpenCategoryDialog = () => {
    if (selectedStartupForMenu) {
      // Initialize selected categories from startup if available
      const currentCategories = selectedStartupForMenu.categories || [];
      setSelectedCategories(currentCategories as CategoryEnum[]);
      setIsCategoryDialogOpen(true);
    }
  };

  // Handle category selection
  const handleCategoryChange = (category: CategoryEnum) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Save selected categories to startup
  const handleSaveCategories = async () => {
    if (!selectedStartupForMenu) return;

    try {
      await supabaseUpdateStartup({
        id: selectedStartupForMenu.id,
        categories: selectedCategories,
      });

      // Update the local state to reflect changes
      if (coachees.length > 0) {
        const updatedCoachees = coachees.map((startup: any) => {
          if (startup.id === selectedStartupForMenu.id) {
            return { ...startup, categories: selectedCategories };
          }
          return startup;
        });

        // Update each startup's coach_id if needed
        for (const startup of updatedCoachees) {
          if (startup.coach_id !== user?.id) {
            await supabaseUpdateStartup({
              id: startup.id,
              coach_id: user?.id,
            });
          }
        }

        // Update local state
        setCoachees(updatedCoachees);
      }

      setNotification({
        message: 'Categories updated successfully',
        severity: 'success',
      });

      setIsCategoryDialogOpen(false);
      handleMenuClose();
    } catch (error) {
      setNotification({
        message: `Error: ${(error as Error).message}`,
        severity: 'error',
      });
    }
  };

  // Toggle startup selection for bulk operations
  const handleStartupSelection = (startup: Startup) => {
    setSelectedStartups(prev => {
      const isSelected = prev.some(s => s.id === startup.id);
      if (isSelected) {
        return prev.filter(s => s.id !== startup.id);
      } else {
        return [...prev, startup];
      }
    });
  };

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      setSelectedStartups([]);
    }
  };

  // Open bulk category assignment dialog
  const handleOpenBulkCategoryDialog = () => {
    if (selectedStartups.length === 0) {
      setNotification({
        message: 'Please select at least one startup',
        severity: 'warning',
      });
      return;
    }

    setSelectedCategories([]);
    setIsBulkCategoryDialogOpen(true);
  };

  // Save categories to multiple startups
  const handleSaveBulkCategories = async () => {
    if (selectedStartups.length === 0) return;

    try {
      // Update each selected startup
      const updatePromises = selectedStartups.map(startup =>
        supabaseUpdateStartup({
          id: startup.id,
          categories: selectedCategories,
        })
      );

      await Promise.all(updatePromises);

      // Update the local state to reflect changes
      if (coachees.length > 0) {
        const updatedCoachees = coachees.map((startup: any) => {
          if (selectedStartups.some(s => s.id === startup.id)) {
            return { ...startup, categories: selectedCategories };
          }
          return startup;
        });
      }

      setNotification({
        message: `Categories updated for ${selectedStartups.length} startups`,
        severity: 'success',
      });

      setIsBulkCategoryDialogOpen(false);
      setIsSelectionMode(false);
      setSelectedStartups([]);
    } catch (error) {
      setNotification({
        message: `Error: ${(error as Error).message}`,
        severity: 'error',
      });
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                {isSelectionMode ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleToggleSelectionMode}
                      color="secondary"
                    >
                      Cancel Selection
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CategoryIcon />}
                      onClick={handleOpenBulkCategoryDialog}
                      disabled={selectedStartups.length === 0}
                    >
                      Assign Categories ({selectedStartups.length})
                    </Button>
                  </>
                ) : (
                  <>
                    <Tooltip title="Select multiple startups to assign categories">
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleToggleSelectionMode}
                      >
                        Assign Categories
                      </Button>
                    </Tooltip>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setIsAssignDialogOpen(true)}
                    >
                      Assign Startup
                    </Button>
                  </>
                )}
              </Box>
            }
          />
          <CardContent>
            <List sx={{ width: '100%' }}>
              {coachees.length > 0 &&
                coachees.map((startup: any, index: number, array: any[]) => {
                  // Count unread requests for this startup
                  const startupRequests = requests.filter(
                    (r) => r.startup?.id === startup.id && !r.read_at,
                  ).length;

                  // Check if this startup is selected for bulk operations
                  const isSelected = selectedStartups.some(s => s.id === startup.id);

                  return (
                    <React.Fragment key={startup.id || index}>
                      <ListItem
                        component={isSelectionMode ? 'div' : Link}
                        to={isSelectionMode ? undefined : `/startups/${startup.id || startup.name?.toLowerCase()}`}
                        secondaryAction={
                          isSelectionMode ? undefined : (
                            <IconButton edge="end" onClick={(e) => handleMenuClick(e, startup)}>
                              <MoreVertIcon />
                            </IconButton>
                          )
                        }
                        sx={{
                          py: 2,
                          textDecoration: 'none',
                          color: 'inherit',
                          bgcolor: isSelectionMode && isSelected ? 'action.selected' : 'inherit',
                          cursor: isSelectionMode ? 'pointer' : 'inherit',
                        }}
                        onClick={isSelectionMode ? () => handleStartupSelection(startup) : undefined}
                      >
                        {isSelectionMode ? (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSelected}
                                color="primary"
                                onChange={() => handleStartupSelection(startup)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            }
                            label=""
                            sx={{ mr: 1, minWidth: '42px' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
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
                        )}
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
                                {/* Display categories if available */}
                                {startup.categories && startup.categories.length > 0 && (
                                  <Box sx={{ display: 'flex', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                                    {(startup.categories as CategoryEnum[]).map((category) => (
                                      <Chip
                                        key={category}
                                        label={categoryDisplayNames[category]}
                                        size="small"
                                        sx={{
                                          backgroundColor: categoryColors[category],
                                          color: '#fff',
                                        }}
                                      />
                                    ))}
                                  </Box>
                                )}
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

        {/* Assign Startup Dialog */}
        <Dialog open={isAssignDialogOpen} onClose={() => setIsAssignDialogOpen(false)}>
          <DialogTitle>Assign Startup</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Startup</InputLabel>
              <Select
                value={selectedStartup}
                onChange={(e) => setSelectedStartup(e.target.value)}
                label="Select Startup"
              >
                {availableStartups.map((startup) => (
                  <MenuItem key={startup.id} value={startup.id}>
                    {startup.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignStartup} variant="contained" disabled={!selectedStartup}>
              Assign
            </Button>
          </DialogActions>
        </Dialog>

        {/* Single Startup Categories Dialog */}
        <Dialog open={isCategoryDialogOpen} onClose={() => setIsCategoryDialogOpen(false)}>
          <DialogTitle>Assign Categories</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select categories that apply to this startup:
            </Typography>
            <FormGroup>
              {Object.entries(categoryDisplayNames).map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(key as CategoryEnum)}
                      onChange={() => handleCategoryChange(key as CategoryEnum)}
                      sx={{
                        '&.Mui-checked': {
                          color: categoryColors[key as CategoryEnum]
                        }
                      }}
                    />
                  }
                  label={value}
                />
              ))}
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategories} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Categories Dialog */}
        <Dialog open={isBulkCategoryDialogOpen} onClose={() => setIsBulkCategoryDialogOpen(false)}>
          <DialogTitle>Bulk Assign Categories</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Assign categories to {selectedStartups.length} selected startups:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selected startups: {selectedStartups.map(s => s.name).join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, mt: 2, color: 'warning.main' }}>
              Note: This will replace any existing categories on the selected startups.
            </Typography>
            <FormGroup>
              {Object.entries(categoryDisplayNames).map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(key as CategoryEnum)}
                      onChange={() => handleCategoryChange(key as CategoryEnum)}
                      sx={{
                        '&.Mui-checked': {
                          color: categoryColors[key as CategoryEnum]
                        }
                      }}
                    />
                  }
                  label={value}
                />
              ))}
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsBulkCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBulkCategories} variant="contained">
              Save to All Selected
            </Button>
          </DialogActions>
        </Dialog>

        {/* Menu for startup actions */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.preventDefault()} // Prevent navigation when clicking menu items
        >
          <MenuItem onClick={handleOpenCategoryDialog}>Assign Categories</MenuItem>
          <MenuItem onClick={handleUnassignFromMenu}>Unassign Startup</MenuItem>
        </Menu>

        {/* Notification Snackbar */}
        {notification && (
          <Snackbar
            open={!!notification}
            autoHideDuration={6000}
            onClose={() => setNotification(null)}
          >
            <Alert
              onClose={() => setNotification(null)}
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        )}
      </CenteredFlexBox>
    </>
  );
}
