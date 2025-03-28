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
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Message as MessageIcon,
  Recommend as RecommendIcon,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import useRecommendations from '@/hooks/useRecommendations';
import useRequests from '@/hooks/useRequests';
import { Recommendation, Startup, Request } from '@/types/strapi';
import { CreateRecommendation, UpdateRecommendation, strapiGetStartup } from '@/lib/strapi';
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
        const startup = await strapiGetStartup(startupId);
        setCurrentStartup(startup);
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

  const handleFormSubmit = async (values: CreateRecommendation | UpdateRecommendation) => {
    setIsSubmitting(true);
    try {
      if ('documentId' in values && values.documentId) {
        // Update
        await updateRecommendation(values as UpdateRecommendation);
        setNotification({
          message: 'Recommendation updated successfully',
          severity: 'success',
        });
      } else {
        // Create
        await createRecommendation(values as CreateRecommendation);
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
        documentId: request.documentId,
        readAt: new Date().toISOString(),
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

  return (
    <>
      <Header title={currentStartup?.name || 'Startup'} />
      <CenteredFlexBox>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={tabValue === 0 ? loadingRecommendations : loadingRequests}
            >
              Refresh
            </Button>
            {tabValue === 0 && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
                Add Recommendation
              </Button>
            )}
          </Box>
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
