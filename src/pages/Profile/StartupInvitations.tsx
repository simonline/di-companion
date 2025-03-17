import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  Box,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import { useAuth } from '@/hooks/useAuth';
import {
  strapiGetInvitations,
  strapiCreateInvitation,
  strapiDeleteInvitation,
  strapiResendInvitation,
} from '@/lib/strapi';
import { Invitation, InvitationStatusEnum } from '@/types/strapi';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StartupInvitations: React.FC = () => {
  const { startupId } = useParams<{ startupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const baseUrl = window.location.origin;

  const loadInvitations = useCallback(async () => {
    if (!startupId) return;

    setLoading(true);
    try {
      const data = await strapiGetInvitations(startupId);
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load invitations',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => {
    if (startupId) {
      loadInvitations();
    }
  }, [startupId, loadInvitations]);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupId || !user || !email) return;

    setInvitationLoading(true);
    try {
      await strapiCreateInvitation({
        startup: { set: { documentId: startupId } },
        invitedBy: { set: { documentId: user.documentId.toString() } },
        email,
      });

      setEmail('');
      await loadInvitations();

      setSnackbar({
        open: true,
        message: 'Invitation sent successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send invitation',
        severity: 'error',
      });
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleDeleteInvitation = async (documentId: string) => {
    try {
      await strapiDeleteInvitation(documentId);
      await loadInvitations();

      setSnackbar({
        open: true,
        message: 'Invitation deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting invitation:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete invitation',
        severity: 'error',
      });
    }
  };

  const handleResendInvitation = async (documentId: string) => {
    try {
      await strapiResendInvitation(documentId);

      setSnackbar({
        open: true,
        message: 'Invitation resent successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      setSnackbar({
        open: true,
        message: 'Failed to resend invitation',
        severity: 'error',
      });
    }
  };

  const copyInvitationLink = (token: string) => {
    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;
    navigator.clipboard.writeText(invitationLink);

    setSnackbar({
      open: true,
      message: 'Invitation link copied to clipboard',
      severity: 'success',
    });
  };

  const getStatusChip = (status: InvitationStatusEnum) => {
    switch (status) {
      case InvitationStatusEnum.pending:
        return <Chip size="small" label="Pending" color="warning" />;
      case InvitationStatusEnum.accepted:
        return <Chip size="small" label="Accepted" color="success" />;
      case InvitationStatusEnum.rejected:
        return <Chip size="small" label="Rejected" color="error" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header title="Manage Team Invitations" />
      <CenteredFlexBox>
        <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/profile/startup/${startupId}`)}
            sx={{ mb: 2 }}
          >
            Back to Startup Profile
          </Button>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Invite Team Members
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Invite team members to join your startup. They will receive an email with a link to
              accept the invitation.
            </Typography>

            <form onSubmit={handleCreateInvitation}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  size="small"
                  disabled={invitationLoading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={invitationLoading}
                  sx={{ minWidth: 100 }}
                >
                  {invitationLoading ? <CircularProgress size={24} /> : 'Invite'}
                </Button>
              </Box>
            </form>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Pending Invitations</Typography>
              <Button startIcon={<RefreshIcon />} onClick={loadInvitations} disabled={loading}>
                Refresh
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : invitations.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No pending invitations
              </Typography>
            ) : (
              <List>
                {invitations.map((invitation) => (
                  <React.Fragment key={invitation.documentId}>
                    <ListItem
                      secondaryAction={
                        <Box>
                          {invitation.invitationStatus === InvitationStatusEnum.pending && (
                            <>
                              <Tooltip title="Copy invitation link">
                                <IconButton
                                  edge="end"
                                  onClick={() => copyInvitationLink(invitation.token)}
                                >
                                  <ContentCopyIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Resend invitation">
                                <IconButton
                                  edge="end"
                                  onClick={() => handleResendInvitation(invitation.documentId)}
                                >
                                  <RefreshIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Delete invitation">
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteInvitation(invitation.documentId)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {invitation.email}
                            {getStatusChip(invitation.invitationStatus)}
                          </Box>
                        }
                        secondary={`Invited by ${invitation.invitedBy.username} on ${new Date(
                          invitation.createdAt,
                        ).toLocaleDateString()}`}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </CenteredFlexBox>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StartupInvitations;
