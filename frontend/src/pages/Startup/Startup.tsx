import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Stack,
  Paper,
  Avatar
} from '@mui/material';
import { 
  Business, 
  Group, 
  Edit, 
  Description, 
  Psychology, 
  RecordVoiceOver, 
  Slideshow,
  TrendingUp,
  Rocket,
  CalendarToday,
  People,
  ArrowForward
} from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';
import { categoryColors } from '@/utils/constants';

function Startup() {
  const { startup } = useAuthContext();
  const navigate = useNavigate();

  if (!startup) {
    return (
      <>
        <Header title="Startup" />
        <CenteredFlexBox>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No Startup Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You need to create or join a startup to access this page.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/create-startup')}
              >
                Create Startup
              </Button>
            </CardContent>
          </Card>
        </CenteredFlexBox>
      </>
    );
  }

  const createdDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isSolo = startup.foundersCount === 1;

  const tools = [
    {
      id: 'team-contract',
      title: isSolo ? 'Solo Contract' : 'Team Contract',
      description: isSolo
        ? 'Define your personal commitment and goals'
        : 'Establish clear agreements with your team',
      icon: Description,
      color: categoryColors.team,
      action: 'Create',
      path: '/tools/team-contract'
    },
    {
      id: 'team-values',
      title: 'Team Values',
      description: 'Define your corporate value set through collaboration',
      icon: Psychology,
      color: categoryColors.team,
      action: 'Define',
      path: '/tools/team-values'
    },
    {
      id: 'interview-analyzer',
      title: 'Interview Analyzer',
      description: 'Record and analyze customer conversations',
      icon: RecordVoiceOver,
      color: categoryColors.stakeholders,
      action: 'Record',
      path: '/tools/interview-analyzer'
    },
    {
      id: 'pitch-deck-analyzer',
      title: 'Pitch Deck Analyzer',
      description: 'Get AI-powered feedback on your presentations',
      icon: Slideshow,
      color: categoryColors.entrepreneur,
      action: 'Analyze',
      path: '/tools/pitch-deck-analyzer'
    }
  ];

  return (
    <>
      <Header title="Startup" />
      <CenteredFlexBox>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{ 
                      width: 80, 
                      height: 80,
                      bgcolor: 'primary.main'
                    }}
                  >
                    <Rocket />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight="700">
                      {startup.name}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Chip 
                        icon={<CalendarToday />} 
                        label={`Founded ${createdDate}`} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        icon={<People />} 
                        label={`${startup.foundersCount || 1} ${startup.foundersCount === 1 ? 'Founder' : 'Founders'}`} 
                        size="small" 
                        variant="outlined"
                      />
                      {startup.score && (
                        <Chip 
                          icon={<TrendingUp />} 
                          label={`${startup.score}% Performance`} 
                          size="small" 
                          color="primary"
                        />
                      )}
                    </Stack>
                  </Box>
                  <Button
                    startIcon={<Edit />}
                    variant="outlined"
                    onClick={() => navigate(`/profile/startup/${startup.documentId}/edit`)}
                  >
                    Edit
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Startup Details
                </Typography>
                <List>
                  <ListItemButton onClick={() => navigate(`/profile/startup/${startup.documentId}`)}>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText primary="View Full Profile" />
                  </ListItemButton>
                  <ListItemButton onClick={() => navigate(`/profile/startup/${startup.documentId}/edit`)}>
                    <ListItemIcon>
                      <Edit />
                    </ListItemIcon>
                    <ListItemText primary="Edit Startup Information" />
                  </ListItemButton>
                  <ListItemButton onClick={() => navigate(`/profile/startup/${startup.documentId}/team`)}>
                    <ListItemIcon>
                      <Group />
                    </ListItemIcon>
                    <ListItemText primary="Manage Team Members" />
                  </ListItemButton>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {startup.score || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Performance Score
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {startup.foundersCount || 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team Members
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  Essential Tools
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Powerful tools to help you build and grow your startup
                </Typography>

                <Grid container spacing={2}>
                  {tools.map((tool) => (
                    <Grid item xs={12} sm={6} lg={3} key={tool.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            borderColor: tool.color,
                            boxShadow: 2,
                          },
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                bgcolor: `${tool.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                              }}
                            >
                              <tool.icon sx={{ color: tool.color, fontSize: 24 }} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600">
                                {tool.title}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {tool.description}
                          </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Button
                            onClick={() => navigate(tool.path)}
                            variant="contained"
                            fullWidth
                            endIcon={<ArrowForward />}
                            sx={{
                              bgcolor: tool.color,
                              color: 'white',
                              '&:hover': {
                                bgcolor: tool.color,
                                opacity: 0.9,
                              },
                            }}
                          >
                            {tool.action}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CenteredFlexBox>
    </>
  );
}

export default Startup;