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
  Avatar,
  ListItemAvatar,
  Tab,
  Tabs,
} from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import { useAuth } from '@/hooks/useAuth';
import {
  strapiGetInvitations,
  strapiCreateInvitation,
  strapiDeleteInvitation,
  strapiResendInvitation,
  strapiGetStartupMembers,
} from '@/lib/strapi';
import { Invitation, InvitationStatusEnum, User } from '@/types/strapi';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `team-tab-${index}`,
    'aria-controls': `team-tabpanel-${index}`,
  };
}

const StartupTeam: React.FC = () => {
  const { startupId } = useParams<{ startupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const loadData = useCallback(async () => {
    if (!startupId) return;

    setLoading(true);
    try {
      const [membersData, invitationsData] = await Promise.all([
        strapiGetStartupMembers(startupId),
        strapiGetInvitations(startupId),
      ]);

      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load team data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => {
    if (startupId) {
      loadData();
    }
  }, [startupId, loadData]);

  // Set tab to invitations if we have invitations but no members
  useEffect(() => {
    if (!loading && invitations?.length > 0 && (!members || members.length === 0)) {
      setTabValue(1); // Switch to invitations tab
    }
  }, [loading, invitations, members]);

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
      await loadData();

      setSnackbar({
        open: true,
        message: 'Invitation sent successfully',
        severity: 'success',
      });
    } catch (error) {
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
      await loadData();

      setSnackbar({
        open: true,
        message: 'Invitation deleted successfully',
        severity: 'success',
      });
    } catch (error) {
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

  const renderMemberList = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!members || members.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No members found
        </Typography>
      );
    }

    return (
      <List>
        {members.map((member) => (
          <React.Fragment key={member.documentId}>
            <ListItem>
              <ListItemAvatar>
                <Avatar>{member.username.charAt(0).toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {`${member.givenName || ''} ${member.familyName || ''}`.trim() ||
                      member.username}
                    {member.documentId === user?.documentId && (
                      <Chip size="small" label="You" color="primary" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {member.email}
                    </Typography>
                    {member.position && ` — ${member.position}`}
                  </>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderInvitationList = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    const pendingInvitations = invitations.filter(
      (invitation) => invitation.invitationStatus === InvitationStatusEnum.pending,
    );

    if (!pendingInvitations || pendingInvitations.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
          No pending invitations
        </Typography>
      );
    }

    return (
      <List>
        {pendingInvitations.map((invitation) => (
          <React.Fragment key={invitation.documentId}>
            <ListItem
              secondaryAction={
                <Box>
                  {invitation.invitationStatus === InvitationStatusEnum.pending && (
                    <>
                      <Tooltip title="Copy invitation link">
                        <IconButton edge="end" onClick={() => copyInvitationLink(invitation.token)}>
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
              <ListItemAvatar>
                <Avatar>
                  <PersonAddIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {invitation.email}
                    {getStatusChip(invitation.invitationStatus)}
                  </Box>
                }
                secondary={
                  invitation.invitedBy && invitation.createdAt
                    ? `Invited by ${invitation.invitedBy.username} on ${new Date(
                        invitation.createdAt,
                      ).toLocaleDateString()}`
                    : 'Invitation details unavailable'
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <>
      <Header title="Manage Team" />
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

          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="team management tabs"
                variant="fullWidth"
              >
                <Tab icon={<PersonIcon />} label="Team Members" {...a11yProps(0)} />
                <Tab icon={<PersonAddIcon />} label="Invitations" {...a11yProps(1)} />
              </Tabs>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1">
                {tabValue === 0 ? 'Team Members' : 'Pending Invitations'}
              </Typography>
              <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
                Refresh
              </Button>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {renderMemberList()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderInvitationList()}
            </TabPanel>
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

export default StartupTeam;
