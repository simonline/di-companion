import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import Meta from '@/components/Meta';
import Box from '@mui/material/Box';
import { CenteredFlexBox } from '@/components/styled';

function Welcome() {
  return (
    <>
      <Meta title="Dynamic Innovation Companion - Welcome" />
      <CenteredFlexBox
        sx={{
          backgroundImage: 'linear-gradient(to bottom right, #1e3c72, #2a5298)',
          color: 'white',
          maxWidth: '100%',
          height: '100%',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
          {/* App Title */}
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome to the
          </Typography>
          <Typography variant="h2" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Dynamic Innovation Companion
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Powered by Strascheg Center for Entrepreneurship (SCE)
          </Typography>

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
      </CenteredFlexBox>
    </>
  );
}

export default Welcome;
