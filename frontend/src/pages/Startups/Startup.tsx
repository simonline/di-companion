import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
  Chip,
  TextField,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Message as MessageIcon,
  Recommend as RecommendIcon,
  Save as SaveIcon,
  NoteAlt as NoteIcon,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import useRecommendations from '@/hooks/useRecommendations';
import useRequests from '@/hooks/useRequests';
import {
  Recommendation,
  RecommendationCreate,
  RecommendationUpdate,
  Request,
  Startup
} from '@/types/database';
import { supabaseGetStartup, supabaseUpdateStartup } from '@/lib/supabase';
import RecommendationForm from './components/RecommendationForm';
import RecommendationList from './components/RecommendationList';
import RequestList from './components/RequestList';
import { useParams } from 'react-router-dom';
import Loading from '@/components/Loading';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StartupView() {
  const { id: startupId } = useParams<{ id: string }>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStartup, setCurrentStartup] = useState<Startup | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [internalComment, setInternalComment] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  const {
    recommendations,
    loading: loadingRecommendations,
    error: errorRecommendations,
    fetchRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
    clearError: clearRecommendationError,
  } = useRecommendations();

  const {
    requests,
    loading: loadingRequests,
    error: errorRequests,
    fetchRequests,
    updateRequest,
    deleteRequest,
    clearError: clearRequestError,
  } = useRequests();

  // Fetch startup details and recommendations when the component mounts
  useEffect(() => {
    if (!startupId) return;
    const fetchStartupDetails = async () => {
      try {
        const startup = await supabaseGetStartup(startupId);
        setCurrentStartup(startup);
        setInternalComment(startup.internal_comment || '');
      } catch (err) {
        setNotification({
          message: `Error loading startup: ${(err as Error).message}`,
          severity: 'error',
        });
      }
    };
    fetchStartupDetails();
    fetchRecommendations(startupId);
    fetchRequests(startupId);
  }, [startupId, fetchRecommendations, fetchRequests]);

  if (!startupId) {
    return <Loading />;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenForm = () => {
    setEditingRecommendation(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRecommendation(undefined);
  };

  const handleEditRecommendation = (recommendation: Recommendation) => {
    setEditingRecommendation(recommendation);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: RecommendationCreate | RecommendationUpdate, patternIds: string[]) => {
    setIsSubmitting(true);
    try {
      if ('id' in values && values.id) {
        // Update
        await updateRecommendation(values as RecommendationUpdate, patternIds);
        setNotification({
          message: 'Recommendation updated successfully',
          severity: 'success',
        });
      } else {
        // Create
        await createRecommendation(values as RecommendationCreate, patternIds);
        setNotification({
          message: 'Recommendation created successfully',
          severity: 'success',
        });
      }
    } catch (err) {
      setNotification({
        message: `Error: ${(err as Error).message}`,
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
      handleCloseForm();
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    try {
      await deleteRecommendation(id);
      setNotification({
        message: 'Recommendation deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      setNotification({
        message: `Error: ${(err as Error).message}`,
        severity: 'error',
      });
    }
  };

  const handleMarkRequestAsRead = async (request: Request) => {
    try {
      await updateRequest({
        id: request.id,
        read_at: new Date().toISOString(),
      });
      setNotification({
        message: 'Request marked as read',
        severity: 'success',
      });
    } catch (err) {
      setNotification({
        message: `Error: ${(err as Error).message}`,
        severity: 'error',
      });
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteRequest(id);
      setNotification({
        message: 'Request deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      setNotification({
        message: `Error: ${(err as Error).message}`,
        severity: 'error',
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleRefresh = () => {
    if (tabValue === 0) {
      fetchRecommendations(startupId);
    } else {
      fetchRequests(startupId);
    }
  };

  const handleSaveInternalComment = async () => {
    setIsSavingComment(true);
    try {
      await supabaseUpdateStartup({
        id: startupId,
        internal_comment: internalComment,
      });

      setNotification({
        message: 'Internal comment saved successfully',
        severity: 'success',
      });
    } catch (err) {
      setNotification({
        message: `Error saving comment: ${(err as Error).message}`,
        severity: 'error',
      });
    } finally {
      setIsSavingComment(false);
    }
  };

  return (
    <>
      <CenteredFlexBox>
        <Box sx={{ mt: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {currentStartup?.name || 'Startup'}
            </Typography>
          </Box>

          {/* Internal Comment Section - Coach Only */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <NoteIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Internal Comment
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              This note is only visible to coaches and will not be shown to startup users.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={internalComment}
              onChange={(e) => setInternalComment(e.target.value)}
              placeholder="Add internal notes about this startup..."
              variant="outlined"
              sx={{ backgroundColor: 'white' }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveInternalComment}
                disabled={isSavingComment}
              >
                {isSavingComment ? 'Saving...' : 'Save Comment'}
              </Button>
            </Box>
          </Paper>
        </Box>

        {errorRecommendations && tabValue === 0 && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {errorRecommendations}
            <Button size="small" onClick={clearRecommendationError} sx={{ ml: 2 }}>
              Dismiss
            </Button>
          </Alert>
        )}

        {errorRequests && tabValue === 1 && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {errorRequests}
            <Button size="small" onClick={clearRequestError} sx={{ ml: 2 }}>
              Dismiss
            </Button>
          </Alert>
        )}

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ width: '100%', mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<RecommendIcon />} label="Recommendations" iconPosition="start" />
          <Tab
            icon={<MessageIcon />}
            label="Requests"
            iconPosition="start"
            sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}
          />
        </Tabs>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <TabPanel value={tabValue} index={0}>
                  {loadingRecommendations ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <RecommendationList
                      recommendations={recommendations || []}
                      onEdit={handleEditRecommendation}
                      onDelete={handleDeleteRecommendation}
                    />
                  )}
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  {loadingRequests ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <RequestList
                      requests={requests || []}
                      onMarkAsRead={handleMarkRequestAsRead}
                      onDelete={handleDeleteRequest}
                      loading={loadingRequests}
                    />
                  )}
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CenteredFlexBox>

      <RecommendationForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialValues={editingRecommendation}
        isSubmitting={isSubmitting}
        startupId={startupId}
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
    </>
  );
}
