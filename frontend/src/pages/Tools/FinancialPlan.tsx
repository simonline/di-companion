import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  AttachMoney,
  Description,
  TrendingUp,
  Delete,
  Info
} from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';

function FinancialPlan() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  
  const { documents, loading, uploading, fetchDocuments, uploadDocument, deleteDocument } = useDocumentUpload({
    type: 'financial_plan',
    onUploadSuccess: () => {
      setUploadDialogOpen(false);
      setFile(null);
      setUploadTitle('');
      setUploadDescription('');
    }
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setUploadTitle(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension for title
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (file && uploadTitle) {
      await uploadDocument(file, uploadTitle, uploadDescription);
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

              <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
                <Typography variant="body2">
                  <strong>Analyzer Coming Soon!</strong> Currently, you can upload and store your financial plans. 
                  The AI-powered analysis features will be available soon.
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

              {/* Uploaded Financial Plans List */}
              {documents.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Your Financial Plans</Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {documents.map((doc, index) => {
                        const date = new Date(doc.attributes.createdAt).toLocaleDateString();
                        return (
                          <React.Fragment key={doc.id}>
                            <ListItem>
                              <ListItemText
                                primary={doc.attributes.title}
                                secondary={`Uploaded on ${date} • Status: ${doc.attributes.status}`}
                              />
                              <IconButton
                                onClick={() => deleteDocument(doc.id)}
                                color="error"
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </ListItem>
                            {index < documents.length - 1 && <Divider />}
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}
                </Box>
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

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Financial Plan</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Financial Plan Title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
            placeholder="e.g., Q1 2024 projections, 3-year plan, Revenue model v2..."
          />
          {file && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Selected file:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Alert>
          )}
          <Alert severity="info">
            <Typography variant="caption">
              Note: Your financial plan will be stored for future analysis. The AI analysis features are coming soon!
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUploadDialogOpen(false);
            setFile(null);
            setUploadTitle('');
            setUploadDescription('');
          }} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!file || !uploadTitle || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Upload Financial Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default FinancialPlan;