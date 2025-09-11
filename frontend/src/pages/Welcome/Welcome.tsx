import React, { useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Avatar, IconButton, Paper } from '@mui/material';
import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AndroidIcon from '@mui/icons-material/Android';
import GetAppIcon from '@mui/icons-material/GetApp';
import CloseIcon from '@mui/icons-material/Close';
import Meta from '@/components/Meta';
import { FlexBox } from '@/components/styled';
import logoImage from '/logo.png';
import { useAuthContext } from '@/hooks/useAuth';
function Welcome() {
  const isMobile = window.innerWidth < 600;
  const { isAuthenticated } = useAuthContext();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  return (
    <>
      <Meta title="Dynamic Innovation Digital Companion - Welcome" />
      <FlexBox
        sx={{
          backgroundColor: '#07bce5',
          color: 'white',
          height: '100%',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Floating Install Button/Guide */}
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {!showInstallGuide ? (
            <IconButton
              onClick={() => setShowInstallGuide(true)}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'transform 0.2s',
              }}
            >
              <GetAppIcon />
            </IconButton>
          ) : (
            <Paper
              elevation={4}
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                width: 340,
                animation: 'slideIn 0.2s ease-out',
                '@keyframes slideIn': {
                  from: {
                    opacity: 0,
                    transform: 'translateX(10px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Install as App
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowInstallGuide(false)}
                  sx={{ color: 'text.secondary' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Content */}
              <Box sx={{ p: 2.5 }}>
                {/* iOS Instructions */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <PhoneIphoneIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                      iPhone / iPad
                    </Typography>
                  </Box>
                  <Box sx={{ pl: 3.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      1. Open in Safari browser<br />
                      2. Tap the Share button<br />
                      3. Select &quot;Add to Home Screen&quot;
                    </Typography>
                  </Box>
                </Box>

                {/* Android Instructions */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <AndroidIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                      Android
                    </Typography>
                  </Box>
                  <Box sx={{ pl: 3.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      1. Open in Chrome browser<br />
                      2. Tap the menu button (⋮)<br />
                      3. Select &quot;Install app&quot;
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        <Container sx={{ mb: 4 }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              position: 'relative',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            {/* Title */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: '5%',
                paddingTop: '5%',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <Typography
                variant="h1"
                gutterBottom
                fontWeight="bold"
                textTransform="uppercase"
                fontSize={isMobile ? '4em' : '8em'}
                lineHeight="1"
                marginBottom="0"
                textAlign="center"
              >
                Dynamic
              </Typography>
              <Typography
                variant="h2"
                gutterBottom
                fontWeight="bold"
                textTransform="uppercase"
                fontSize={isMobile ? '2.8em' : '5.7em'}
                lineHeight="1"
                marginTop={isMobile ? '-.3em' : '-.3em'}
                textAlign="center"
              >
                Innovation
              </Typography>
              <Typography
                variant="h4"
                paragraph
                fontWeight="bold"
                textTransform="uppercase"
                fontSize={isMobile ? '1.3em' : '2.5em'}
                lineHeight="1"
                color="#abe0f3"
                textAlign="right"
              >
                AI Companion for
                <br />
                Your Startup Journey
              </Typography>
            </div>
          </div>

          {/* Feature Cards */}
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
            {/* Explore Feature */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mx: 'auto', mb: 2 }}>
                    <StyleIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Explore the Pattern Play Cards
                  </Typography>
                  <Typography variant="body2">
                    Discover creative patterns to boost your startup journey.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Progress Feature */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mx: 'auto', mb: 2 }}>
                    <BookmarkIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Progress and Focus on What Matters
                  </Typography>
                  <Typography variant="body2">
                    Work on the most relevant tasks in your current phase.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Dashboard Feature */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mx: 'auto', mb: 2 }}>
                    <SpeedIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Entprepreneurship Journey
                  </Typography>
                  <Typography variant="body2">
                    Discover your personalized path to success.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Coach Feature */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mx: 'auto', mb: 2 }}>
                    <ForumIcon />
                  </Avatar>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Recommendations & Coach Support
                  </Typography>
                  <Typography variant="body2">
                    Get expert guidance tailored to your needs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Signup and Login Buttons */}
          {!isAuthenticated && (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Button
                variant="contained"
                size="large"
                href="/signup"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  mr: 2,
                }}
              >
                Sign Up
              </Button>
              <Button variant="outlined" color="inherit" size="large" href="/login">
                Login
              </Button>
            </Box>
          )}

          {/* Logo */}
          <Grid container justifyContent="flex-end" alignItems="flex-end">
            <Grid item xs={12} sm={3}>
              <Box>
                <img
                  src={logoImage}
                  alt="SCE logo"
                  width="100%"
                  style={{
                    position: 'relative',
                    bottom: '-40px',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </FlexBox>
    </>
  );
}

export default Welcome;
