import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';

function Dashboard() {
  return (
    <>
      <Meta title="page 3" />
      <FullSizeCenteredFlexBox>
        <Typography variant="h3">Dashboard</Typography>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Dashboard;
