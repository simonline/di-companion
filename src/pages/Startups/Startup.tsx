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
import { Recommendation } from '@/types/strapi';
import { CreateRecommendation, UpdateRecommendation } from '@/lib/strapi';
import RecommendationForm from './components/RecommendationForm';
import RecommendationList from './components/RecommendationList';
import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'react-router-dom';

export default function StartupView() {
  const { user } = useAuth();
  const { startupId } = useParams<{ startupId: string }>();

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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<Recommendation | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  // Find current startup
  const currentStartup =
    user?.startups?.find((s) => s.documentId === startupId) ||
    user?.coachees?.find((s) => s.documentId === startupId);

  // Filter recommendations for the current startup
  const filteredRecommendations =
    recommendations?.filter((rec) => rec.startup?.id === startupId) || [];

  // Fetch recommendations when the component mounts
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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
      // Ensure the recommendation is linked to current startup
      const valuesWithStartup = {
        ...values,
        startup: { id: startupId },
      };

      if ('documentId' in valuesWithStartup && valuesWithStartup.documentId) {
        await updateRecommendation(valuesWithStartup as UpdateRecommendation);
        setNotification({
          message: 'Recommendation updated successfully',
          severity: 'success',
        });
      } else {
        await createRecommendation(valuesWithStartup as CreateRecommendation);
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
    fetchRecommendations();
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
                    recommendations={filteredRecommendations}
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
