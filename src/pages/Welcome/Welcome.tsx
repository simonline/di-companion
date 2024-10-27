import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';

function Welcome() {
  return (
    <>
      <Meta title="Dynamic Innovation Companion - Welcome" />
      <FullSizeCenteredFlexBox>
        <Container maxWidth="lg">
          {/* App Title */}
          <Typography variant="h3" align="center" gutterBottom>
            Welcome to Dynamic Innovation Companion
          </Typography>
          <Typography variant="subtitle1" align="center" paragraph>
            Powered by Strascheg Center for Entrepreneurship (SCE)
          </Typography>

          {/* Feature Cards in 2x2 Grid */}
          <Grid container spacing={4} justifyContent="center">
            {/* Explore Feature */}
            <Grid item xs={12} sm={6}>
              <Card elevation={3}>
                <CardHeader
                  avatar={
                    <Avatar>
                      <StyleIcon color="primary" />
                    </Avatar>
                  }
                  title="Explore: Pattern Play Cards"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Discover creative patterns to boost your startup journey.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Progress Feature */}
            <Grid item xs={12} sm={6}>
              <Card elevation={3}>
                <CardHeader
                  avatar={
                    <Avatar>
                      <BookmarkIcon color="primary" />
                    </Avatar>
                  }
                  title="Progress: Focus on What Matters"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Work on the most relevant tasks in your current phase.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Dashboard Feature */}
            <Grid item xs={12} sm={6}>
              <Card elevation={3}>
                <CardHeader
                  avatar={
                    <Avatar>
                      <SpeedIcon color="primary" />
                    </Avatar>
                  }
                  title="Dashboard: Entrepreneurship Journey"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Discover your personalized path to success.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Coach Feature */}
            <Grid item xs={12} sm={6}>
              <Card elevation={3}>
                <CardHeader
                  avatar={
                    <Avatar>
                      <ForumIcon color="primary" />
                    </Avatar>
                  }
                  title="Coach: Recommendations & Support"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    Get expert guidance tailored to your needs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Signup and Login Buttons */}
          <Grid container spacing={2} justifyContent="center" style={{ marginTop: '40px' }}>
            <Grid item>
              <Button variant="contained" color="primary" size="large" href="/signup">
                Sign Up
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" size="large" href="/login">
                Login
              </Button>
            </Grid>
          </Grid>
        </Container>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Welcome;
