import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  AttachMoney,
  Description,
  TrendingUp
} from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';

function FinancialPlan() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setIsUploaded(false);
    }
  };

  const handleUpload = () => {
    if (file) {
      // Handle file upload logic here
      setIsUploaded(true);
    }
  };

  return (
    <>
      <Header title="Financial Plan" />
      <CenteredFlexBox>
        <Box sx={{ maxWidth: 800, width: '100%' }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AttachMoney sx={{ color: 'success.main', fontSize: 28 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight="700">
                    Financial Plan Upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload your financial plan for future analysis
                  </Typography>
                </Box>
              </Stack>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  The Financial Plan Analyzer is coming soon. For now, you can upload your financial plan 
                  to save it for future analysis.
                </Typography>
              </Alert>

              <Paper
                sx={{
                  p: 4,
                  width: '100%',
                  display: 'block',
                  border: '2px dashed',
                  borderColor: file ? 'success.main' : 'divider',
                  bgcolor: file ? 'success.lighter' : 'background.default',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept=".pdf,.xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {file ? 'File Selected' : 'Click to Upload Financial Plan'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {file ? file.name : 'Supported formats: PDF, Excel (.xlsx, .xls), CSV'}
                </Typography>
                {file && (
                  <Chip
                    icon={<Description />}
                    label={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>

              {file && !isUploaded && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CloudUpload />}
                    onClick={handleUpload}
                    sx={{ minWidth: 200 }}
                  >
                    Upload Financial Plan
                  </Button>
                </Box>
              )}

              {isUploaded && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    Your financial plan has been uploaded successfully! 
                    We'll notify you when the analyzer feature becomes available.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Coming Soon: Financial Plan Analyzer
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Our AI-powered financial analyzer will help you:
              </Typography>
              
              <Stack spacing={2}>
                {[
                  'Validate financial projections and assumptions',
                  'Identify potential risks and opportunities',
                  'Compare against industry benchmarks',
                  'Generate investor-ready financial summaries',
                  'Provide actionable recommendations for improvement'
                ].map((feature, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <TrendingUp sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2">{feature}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </CenteredFlexBox>
    </>
  );
}

export default FinancialPlan;