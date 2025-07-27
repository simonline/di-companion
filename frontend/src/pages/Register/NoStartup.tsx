import { Box, Button, Card, CardContent, Container, Divider, Typography } from '@mui/material';
import Header from '@/sections/Header';
import { Link } from 'react-router-dom';

function NoStartup() {
  return (
    <>
      <Header title="Join or Create a Startup" />
      <Container maxWidth="md" sx={{ my: 8 }}>
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 4, md: 0 },
              }}
            >
              {/* Option 1: Join */}
              <Box
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Join an Existing Startup
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Ask members of an existing startup to send you an invitation to join their team.
                  </Typography>
                </Box>
              </Box>

              {/* Divider */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  px: 3,
                }}
              >
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    height: '120px',
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    mx: 3,
                    my: { xs: 0, md: 2 },
                  }}
                >
                  OR
                </Typography>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    height: '120px',
                  }}
                />
                <Divider
                  orientation="horizontal"
                  sx={{
                    display: { xs: 'block', md: 'none' },
                    width: '80%',
                    my: 2,
                  }}
                />
              </Box>

              {/* Option 2: Create */}
              <Box
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                    Create a New Startup
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                    Register your startup to get personalized guidance and support.
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  to="/create-startup"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ px: 4, py: 1.5 }}
                >
                  Create a Startup
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Your information is secure and will only be used to provide you with better guidance.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default NoStartup;
