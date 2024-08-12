import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';

function Profile() {
  return (
    <>
      <Meta title="Welcome" />
      <FullSizeCenteredFlexBox>
        <Typography variant="h3">Profile</Typography>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Profile;
