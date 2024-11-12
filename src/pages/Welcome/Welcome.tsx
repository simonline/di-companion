import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Avatar } from '@mui/material';
import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import Meta from '@/components/Meta';
import { FlexBox } from '@/components/styled';
import logoImage from '/logo.png';

function Welcome() {
  const isMobile = window.innerWidth < 600;
  return (
    <>
      <Meta title="Dynamic Innovation Companion - Welcome" />
      <FlexBox
        sx={{
          backgroundColor: '#006a9d',
          color: 'white',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {/* Wedge in background */}
        <div
          style={{
            position: 'absolute',
            top: '3%',
            left: 0,
            width: '100%', // Control the width of the wedge
            height: '40%',
            backgroundColor: '#009fe3', // Turquoise color
            clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)', // Creates the wedge/trapezoidal shape
            zIndex: 1, // Ensure it sits behind the logo and text
          }}
        />
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
            {/* Logo and App Title */}
            <div
              style={{
                position: 'relative',
                width: '24vh',
                height: '24vh',
                border: '2px dotted white',
                borderRadius: '50%',
                padding: '20px',
                zIndex: 2,
              }}
            >
              <img
                src={logoImage}
                alt="Real Time Innovation Logo"
                style={{
                  width: '76%',
                  height: '76%',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '12%',
                  left: '12%',
                  zIndex: 2,
                }}
              />
            </div>
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
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Dynamic Innovation Companion
              </Typography>
              <Typography variant="h6" paragraph sx={{ fontWeight: 'normal' }}>
                Powered by Strascheg Center for Entrepreneurship (SCE)
              </Typography>
            </div>
          </div>

          {/* Feature Cards */}
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
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
                  <Typography variant="h6" gutterBottom>
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
                  <Typography variant="h6" gutterBottom>
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
                  <Typography variant="h6" gutterBottom>
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
                  <Typography variant="h6" gutterBottom>
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
        </Container>
      </FlexBox>
    </>
  );
}

export default Welcome;
