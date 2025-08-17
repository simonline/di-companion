import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Avatar } from '@mui/material';
import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import Meta from '@/components/Meta';
import { FlexBox } from '@/components/styled';
import logoImage from '/logo.png';
import { useAuthContext } from '@/hooks/useAuth';
function Welcome() {
  const isMobile = window.innerWidth < 600;
  const { isAuthenticated } = useAuthContext();
  return (
    <>
      <Meta title="Dynamic Innovation Digital Companion - Welcome" />
      <FlexBox
        sx={{
          backgroundColor: '#07bce5',
          color: 'white',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
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
                Change the Patterns
                <br />
                Change your Thinking
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
              <Box position="relative" bottom="-40px" right="0">
                <img src={logoImage} alt="SCE logo" width="100%" />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </FlexBox>
    </>
  );
}

export default Welcome;
