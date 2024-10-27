import Typography from '@mui/material/Typography';
import { Button, Grid } from '@mui/material';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';

function Profile() {
  const { user } = useAuth();

  return (
    <>
      <Meta title="Welcome" />
      <FullSizeCenteredFlexBox>
        <Typography variant="h3">
          {user ? (
            `Welcome, ${user.profile.given_name}!`
          ) : (
            <>
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
            </>
          )}
        </Typography>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Profile;
