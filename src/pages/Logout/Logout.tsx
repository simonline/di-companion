import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(true);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      setShowConfirmDialog(false); // Hide dialog on error
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="200px"
        p={3}
      >
        <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 400 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Dialog
        open={showConfirmDialog && !isLoggingOut}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log out? Any unsaved changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="primary" variant="contained" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {isLoggingOut && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(255, 255, 255, 0.8)"
          zIndex={9999}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
              Logging out...
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Logout;
