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
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import useRecommendations from '@/hooks/useRecommendations';
import { Recommendation, Startup } from '@/types/strapi';
import { CreateRecommendation, UpdateRecommendation, strapiGetStartup } from '@/lib/strapi';
import RecommendationForm from './components/RecommendationForm';
import RecommendationList from './components/RecommendationList';
import { useParams } from 'react-router-dom';
import Loading from '@/components/Loading';

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

  const {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation,
    clearError,
  } = useRecommendations();

  // Fetch startup details and recommendations when the component mounts
  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (!startupId) return;
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
  }, [startupId, fetchRecommendations]);

  if (!startupId) {
    return <Loading />;
  }

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

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleRefresh = () => {
    fetchRecommendations(startupId);
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
              disabled={loading}
            >
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
              Add Recommendation
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {error}
            <Button size="small" onClick={clearError} sx={{ ml: 2 }}>
              Dismiss
            </Button>
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                {loading ? (
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
