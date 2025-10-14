import React from 'react';
import { Box } from '@mui/material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import DocumentManager from '@/components/DocumentManager';
import { useAuthContext } from '@/hooks/useAuth';

const Capture: React.FC = () => {
  const { startup } = useAuthContext();

  return (
    <>
      <Header title="Workshop Capture" />
      <CenteredFlexBox>
        <Box sx={{ maxWidth: 1200, width: '100%', mt: 4 }}>
          <DocumentManager
            entityType="startup"
            entityId={startup?.id}
            title="Add your content"
            description="Upload workshop materials, PDFs, images, notes, and other documents from your sessions"
          />
        </Box>
      </CenteredFlexBox>
    </>
  );
};

export default Capture;