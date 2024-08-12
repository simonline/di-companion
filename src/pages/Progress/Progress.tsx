import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';

function Progress() {
  return (
    <>
      <Meta title="page 2" />
      <FullSizeCenteredFlexBox>
        <Typography variant="h3">Progress</Typography>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Progress;
