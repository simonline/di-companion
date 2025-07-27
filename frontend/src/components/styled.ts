import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { getPageHeight } from '@/routes/Pages/utils';

const FlexBox = styled(Box)({
  display: 'flex',
  position: 'relative',
});

const CenteredFlexBox = styled(FlexBox)(({ theme }) => ({
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  padding: theme.spacing(2),
  maxWidth: '800px',
  margin: '0 auto',
}));

const FullSizeCenteredFlexBox = styled(CenteredFlexBox)(({ theme }) => ({
  width: '100%',
  height: getPageHeight(theme, true),
}));

export { FlexBox, CenteredFlexBox, FullSizeCenteredFlexBox };
