import React from 'react';
import { Box } from '@mui/material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import DocumentManager from '@/components/DocumentManager';

const Capture: React.FC = () => {

  return (
    <>
      <Header title="Workshop Capture" />
      <CenteredFlexBox>
        <Box sx={{ maxWidth: 1200, width: '100%', mt: 4 }}>
          <DocumentManager
            title="Workshop Materials"
            description="Upload workshop materials, PDFs, images, notes, and other documents from your sessions"
          />
        </Box>
      </CenteredFlexBox>
    </>
  );
};

export default Capture;