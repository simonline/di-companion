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
    Slideshow,
    CloudUpload,
    Description,
    TrendingUp,
    Delete,
    Visibility,
    Info
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';

const PitchDeckAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    
    const { documents, loading, uploading, fetchDocuments, uploadDocument, deleteDocument } = useDocumentUpload({
        type: 'pitch_deck',
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
            <Header title="Pitch Deck Analyzer" />
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
                                        bgcolor: 'primary.light',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Slideshow sx={{ color: 'primary.main', fontSize: 28 }} />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" fontWeight="700">
                                        Pitch Deck Upload
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Upload your pitch deck for future analysis
                                    </Typography>
                                </Box>
                            </Stack>

                            <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
                                <Typography variant="body2">
                                    <strong>Analyzer Coming Soon!</strong> Currently, you can upload and store your pitch decks. 
                                    The AI-powered analysis features will be available soon.
                                </Typography>
                            </Alert>

                            <Paper
                                sx={{
                                    p: 4,
                                    width: '100%',
                                    display: 'block',
                                    border: '2px dashed',
                                    borderColor: file ? 'primary.main' : 'divider',
                                    bgcolor: file ? 'primary.lighter' : 'background.default',
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
                                    accept=".pdf,.ppt,.pptx,.key"
                                    onChange={handleFileChange}
                                />
                                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    {file ? 'File Selected' : 'Click to Upload Pitch Deck'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {file ? file.name : 'Supported formats: PDF, PowerPoint (.ppt, .pptx), Keynote (.key)'}
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

                            {/* Uploaded Pitch Decks List */}
                            {documents.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Your Pitch Decks</Typography>
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
                                Coming Soon: Pitch Deck Analyzer
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Our AI-powered pitch deck analyzer will help you:
                            </Typography>
                            
                            <Stack spacing={2}>
                                {[
                                    'Evaluate structure and flow of your presentation',
                                    'Analyze content quality and messaging clarity',
                                    'Review visual design and slide consistency',
                                    'Assess investor readiness and appeal',
                                    'Provide actionable feedback for improvement',
                                    'Compare against successful pitch deck patterns'
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
                <DialogTitle>Upload Pitch Deck</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Pitch Deck Title"
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
                        placeholder="e.g., Version 2.0, Investor meeting presentation, Q1 2024 update..."
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
                            Note: Your pitch deck will be stored for future analysis. The AI analysis features are coming soon!
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
                        {uploading ? 'Uploading...' : 'Upload Pitch Deck'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PitchDeckAnalyzer;