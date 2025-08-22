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
    Divider,
} from '@mui/material';
import {
    AccountTree,
    CloudUpload,
    Description,
    Delete,
    Info,
    ArrowBack
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useNavigate } from 'react-router-dom';
import { categoryColors } from '@/utils/constants';

const StakeholderMap: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');

    const { documents, loading, uploading, fetchDocuments, uploadDocument, deleteDocument } = useDocumentUpload({
        type: 'other',
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
            <Header title="Stakeholder Map" />
            <CenteredFlexBox>
                <Box sx={{ maxWidth: 1200, width: '100%', mt: 4 }}>
                    <Box sx={{ mb: 1 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/startup')}
                            sx={{ color: 'text.secondary' }}
                        >
                            Back to Startup
                        </Button>
                    </Box>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        bgcolor: `${categoryColors.stakeholders}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <AccountTree sx={{ color: categoryColors.stakeholders, fontSize: 28 }} />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" fontWeight="700">
                                        Stakeholder Map
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Upload your stakeholder map for future analysis
                                    </Typography>
                                </Box>
                            </Stack>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" fontWeight="600" gutterBottom>
                                    Helpful Tips for Creating Your Stakeholder Map:
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                                    <Typography variant="body2" component="li">
                                        Use <a href="https://kumu.io" target="_blank" rel="noopener noreferrer">Kumu.io</a> for interactive stakeholder mapping and visualization
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Try <a href="https://miro.com" target="_blank" rel="noopener noreferrer">Miro</a> or <a href="https://mural.co" target="_blank" rel="noopener noreferrer">Mural</a> for collaborative workshops
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Apply the Power-Interest Grid to categorize stakeholders
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Include both internal and external stakeholders
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Update your map regularly as relationships evolve
                                    </Typography>
                                </Box>
                            </Box>

                            <Paper
                                sx={{
                                    p: 4,
                                    width: '100%',
                                    display: 'block',
                                    border: '2px dashed',
                                    borderColor: file ? categoryColors.stakeholders : 'divider',
                                    bgcolor: file ? `${categoryColors.stakeholders}08` : 'background.default',
                                    textAlign: 'center',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: categoryColors.stakeholders,
                                        bgcolor: 'action.hover'
                                    }
                                }}
                                component="label"
                            >
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.png,.jpg,.jpeg,.svg"
                                    onChange={handleFileChange}
                                />
                                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    {file ? 'File Selected' : 'Click to Upload Stakeholder Map'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {file ? file.name : 'Supported formats: PDF, PNG, JPG, SVG'}
                                </Typography>
                                {file && (
                                    <Chip
                                        icon={<Description />}
                                        label={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                        sx={{
                                            mt: 1,
                                            bgcolor: `${categoryColors.stakeholders}20`,
                                            color: categoryColors.stakeholders
                                        }}
                                    />
                                )}
                            </Paper>

                            <Alert
                                severity="info"
                                sx={{
                                    mt: 3,
                                    bgcolor: `${categoryColors.stakeholders}20`,
                                    color: categoryColors.stakeholders,
                                    '& .MuiAlert-icon': {
                                        color: categoryColors.stakeholders
                                    }
                                }}
                                icon={<Info />}
                            >
                                <Typography variant="body2">
                                    <strong>AI Analysis Coming Soon!</strong> Our analyzer will help you identify key relationships,
                                    assess stakeholder influence and interest levels, and provide strategic engagement recommendations.
                                </Typography>
                            </Alert>

                            {/* Uploaded Stakeholder Maps List */}
                            {documents.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Your Stakeholder Maps</Typography>
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
                </Box>
            </CenteredFlexBox>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Stakeholder Map</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Map Title"
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
                        placeholder="e.g., Q1 2024 stakeholder analysis, Initial mapping, Updated after pivot..."
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
                            Note: Your stakeholder map will be stored for future analysis. The AI analysis features are coming soon!
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
                        sx={{ bgcolor: categoryColors.stakeholders }}
                    >
                        {uploading ? 'Uploading...' : 'Upload Map'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StakeholderMap;