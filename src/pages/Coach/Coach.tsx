import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';

function Coach() {
  return (
    <>
      <Meta title="page 4" />
      <FullSizeCenteredFlexBox flexDirection="column">
        <Typography variant="h3">Coach</Typography>
        <Button
          to={`/${Math.random().toString()}`}
          component={Link}
          variant="outlined"
          sx={{ mt: 4 }}
          size="small"
          color="warning"
        >
          Whant to check 404?
        </Button>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Coach;
