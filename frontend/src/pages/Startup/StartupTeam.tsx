import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Avatar,
  ListItemAvatar,
  Tab,
  Tabs,
  Menu,
  MenuItem,
} from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';
import {
  supabaseGetInvitations,
  supabaseCreateInvitation,
  supabaseDeleteInvitation,
  supabaseResendInvitation,
  supabaseGetStartupMembers,
} from '@/lib/supabase';
import {
  Invitation,
  Profile
} from '@/types/database';
import { InvitationStatusEnum, categoryColors } from '@/utils/constants';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBack from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useNotifications from '@/store/notifications';

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
  const navigate = useNavigate();
  const { user, profile, startup, updateStartup } = useAuthContext();
  const [, notificationsActions] = useNotifications();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  const baseUrl = window.location.origin;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const loadData = useCallback(async () => {
    if (!startup?.id) return;

    setLoading(true);
    try {
      const [membersData, invitationsData] = await Promise.all([
        supabaseGetStartupMembers(startup!.id),
        supabaseGetInvitations(startup!.id),
      ]);
      console.log("Setting: " + JSON.stringify(membersData));
      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading team data:', error);
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to load team data',
      });
    } finally {
      setLoading(false);
    }
  }, [startup, updateStartup]);

  useEffect(() => {
    if (startup!.id) {
      loadData();
    }
  }, [startup, loadData]);

  // Set tab to invitations if we have invitations but no members
  useEffect(() => {
    if (!loading && invitations?.length > 0 && (!members || members.length === 0)) {
      setTabValue(1); // Switch to invitations tab
    }
  }, [loading, invitations, members]);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startup!.id || !user || !email) return;

    setInvitationLoading(true);
    try {
      // Get the current user's profile for inviter_name
      const inviterName = profile?.given_name && profile?.family_name
        ? `${profile.given_name} ${profile.family_name}`
        : profile?.username || user.email || 'A team member';

      await supabaseCreateInvitation({
        startup_id: startup!.id,
        invited_by_id: user.id,
        email,
        inviter_name: inviterName,
        startup_name: startup!.name || 'the startup',
      });

      setEmail('');
      await loadData();

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Invitation sent successfully. Email has been sent.',
      });
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: error instanceof Error ? error.message : 'Failed to send invitation',
      });
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      await supabaseDeleteInvitation(id);
      await loadData();

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Invitation deleted successfully',
      });
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to delete invitation',
      });
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      await supabaseResendInvitation(id);
      await loadData(); // Reload to show updated expiration date

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Invitation resent successfully. Reminder email has been sent.',
      });
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: error instanceof Error ? error.message : 'Failed to resend invitation',
      });
    }
  };

  const copyInvitationLink = (token: string) => {
    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;
    navigator.clipboard.writeText(invitationLink);

    notificationsActions.push({
      options: { variant: 'success' },
      message: 'Invitation link copied to clipboard',
    });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, invitation: Invitation) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvitation(invitation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvitation(null);
  };

  const handleMenuAction = async (action: 'copy' | 'resend' | 'delete') => {
    if (!selectedInvitation) return;

    switch (action) {
      case 'copy':
        copyInvitationLink(selectedInvitation.token!);
        break;
      case 'resend':
        await handleResendInvitation(selectedInvitation.id);
        break;
      case 'delete':
        await handleDeleteInvitation(selectedInvitation.id);
        break;
    }
    handleMenuClose();
  };

  const handleComplete = async () => {
    if (!startup) return;

    try {
      // Mark progress as complete
      await updateStartup({
        id: startup.id,
        progress: {
          ...startup.progress,
          'startup-team': true
        }
      });

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Team setup completed!',
      });

      navigate('/startup');
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to complete team setup',
      });
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
          <React.Fragment key={member.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar>{(member.username || member.email)?.charAt(0).toUpperCase() || 'U'}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {`${member.given_name || ''} ${member.family_name || ''}`.trim() ||
                      member.username ||
                      member.email}
                    {member.id === user?.id && (
                      <Chip size="small" label="You" sx={{ backgroundColor: categoryColors.team, color: 'white' }} />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {member.position}
                    </Typography>
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
      (invitation) => invitation.invitation_status === InvitationStatusEnum.pending,
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
          <React.Fragment key={invitation.id}>
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuClick(e, invitation)}
                  size="small"
                  sx={{
                    minWidth: 32,
                    width: 32,
                    height: 32,
                    padding: 0,
                    '& .MuiSvgIcon-root': {
                      fontSize: 20,
                    },
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              }
              sx={{
                py: 1,
                pr: 1,
                '& .MuiListItemSecondaryAction-root': {
                  position: 'static',
                  transform: 'none',
                  marginLeft: 0,
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  <PersonAddIcon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                      pr: 4,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        wordBreak: 'break-all',
                        flex: '1 1 auto',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      {invitation.email}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 0.25,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    {invitation.created_at
                      ? `Invited on ${new Date(
                        invitation.created_at,
                      ).toLocaleDateString()}`
                      : 'Invitation details unavailable'}
                    {invitation.invited_by && (
                      <> by {invitation.invited_by.given_name || invitation.invited_by.username || 'Unknown'}</>
                    )}
                  </Typography>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
        >
          {selectedInvitation?.invitation_status === InvitationStatusEnum.pending && (
            <>
              <MenuItem onClick={() => handleMenuAction('copy')}>
                <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
                Copy invitation link
              </MenuItem>
              <MenuItem onClick={() => handleMenuAction('resend')}>
                <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
                Resend invitation
              </MenuItem>
            </>
          )}
          <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete invitation
          </MenuItem>
        </Menu>
      </List>
    );
  };

  return (
    <>
      <Header title="Manage Team" />
      <CenteredFlexBox>
        <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/startup`)}
            sx={{ color: 'text.secondary' }}
          >
            Back to Startup
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
                  sx={{ minWidth: 100, backgroundColor: categoryColors.team, '&:hover': { backgroundColor: categoryColors.team, filter: 'brightness(0.9)' } }}
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
                sx={{
                  '& .MuiTabs-indicator': { backgroundColor: categoryColors.team },
                  '& .MuiTab-root.Mui-selected': {
                    color: categoryColors.team,
                    '& .MuiSvgIcon-root': { color: categoryColors.team }
                  }
                }}
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
              <Button startIcon={<RefreshIcon />} onClick={loadData} disabled={loading} sx={{ color: categoryColors.team }}>
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

          {/* Done Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleComplete}
              disabled={!members || members.length === 0}
              sx={{
                backgroundColor: categoryColors.team,
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: categoryColors.team,
                  filter: 'brightness(0.9)'
                },
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'text.disabled',
                }
              }}
            >
              Done - Mark as Complete
            </Button>
          </Box>
        </Box>
      </CenteredFlexBox>
    </>
  );
};

export default StartupTeam;
