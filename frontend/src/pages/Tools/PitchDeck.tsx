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
    Slideshow,
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

const PitchDeck: React.FC = () => {
    const navigate = useNavigate();
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
            <Header title="Pitch Deck" />
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
                                        bgcolor: `${categoryColors.product}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Slideshow sx={{ color: categoryColors.product, fontSize: 28 }} />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" fontWeight="700">
                                        Pitch Deck
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Upload your pitch deck for future analysis
                                    </Typography>
                                </Box>
                            </Stack>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" fontWeight="600" gutterBottom>
                                    Helpful Tips for Creating Your Pitch Deck:
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                                    <Typography variant="body2" component="li">
                                        Use <a href="https://canva.com" target="_blank" rel="noopener noreferrer">Canva</a> or <a href="https://pitch.com" target="_blank" rel="noopener noreferrer">Pitch</a> for professional templates
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Keep it concise - aim for 10-15 slides maximum
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Include: Problem, Solution, Market, Business Model, Team
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Use visuals and infographics for data
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Practice your pitch timing - aim for 3-5 minutes
                                    </Typography>
                                </Box>
                            </Box>

                            <Paper
                                sx={{
                                    p: 4,
                                    width: '100%',
                                    display: 'block',
                                    border: '2px dashed',
                                    borderColor: file ? categoryColors.product : 'divider',
                                    bgcolor: file ? `${categoryColors.product}08` : 'background.default',
                                    textAlign: 'center',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: categoryColors.product,
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
                                        sx={{
                                            mt: 1,
                                            bgcolor: `${categoryColors.product}20`,
                                            color: categoryColors.product
                                        }}
                                    />
                                )}
                            </Paper>

                            <Alert
                                severity="info"
                                sx={{
                                    mt: 3,
                                    bgcolor: `${categoryColors.product}20`,
                                    color: categoryColors.product,
                                    '& .MuiAlert-icon': {
                                        color: categoryColors.product
                                    }
                                }}
                                icon={<Info />}
                            >
                                <Typography variant="body2">
                                    <strong>AI Analysis Coming Soon!</strong> Our analyzer will evaluate your deck's structure,
                                    messaging clarity, visual design, investor readiness, and provide actionable feedback
                                    to improve your pitch.
                                </Typography>
                            </Alert>

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
                                                const date = new Date(doc.attributes.created_at).toLocaleDateString();
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
                        sx={{ bgcolor: categoryColors.product }}
                    >
                        {uploading ? 'Uploading...' : 'Upload Pitch Deck'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PitchDeck;