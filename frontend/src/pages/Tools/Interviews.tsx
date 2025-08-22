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
    RecordVoiceOver,
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

const Interviews: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');

    const { documents, loading, uploading, fetchDocuments, uploadDocument, deleteDocument } = useDocumentUpload({
        type: 'interview',
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
            <Header title="Interviews" />
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
                                    <RecordVoiceOver sx={{ color: categoryColors.stakeholders, fontSize: 28 }} />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" fontWeight="700">
                                        Interviews
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Upload your interview recordings or transcripts for future analysis
                                    </Typography>
                                </Box>
                            </Stack>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" fontWeight="600" gutterBottom>
                                    Helpful Tips for Conducting Interviews:
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                                    <Typography variant="body2" component="li">
                                        Use <a href="https://memoro.ai" target="_blank" rel="noopener noreferrer">Memoro.ai</a> for automatic transcription
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Try <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">Calendly</a> to schedule interviews efficiently
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Use <a href="https://typeform.com" target="_blank" rel="noopener noreferrer">Typeform</a> for structured interview questions
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Prepare open-ended questions for detailed responses
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Aim for 15-30 minute sessions to respect time
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
                                            accept=".mp3,.mp4,.wav,.m4a,.txt,.docx,.pdf"
                                            onChange={handleFileChange}
                                        />
                                        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            {file ? 'File Selected' : 'Click to Upload Interview'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {file ? file.name : 'Audio (MP3, WAV), Video (MP4), Text (TXT, DOCX, PDF)'}
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
                                    <strong>AI Analysis Coming Soon!</strong> Our analyzer will automatically transcribe audio,
                                    extract key insights, identify pain points and needs, and generate actionable recommendations
                                    from your customer interviews.
                                </Typography>
                            </Alert>

                            {/* Uploaded Interviews List */}
                            {documents.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Your Interviews</Typography>
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
                <DialogTitle>Upload Interview</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Interview Title"
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
                        placeholder="e.g., Customer interview #5, Product feedback session, User research with target demographic..."
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
                            Note: Your interview will be stored for future analysis. The AI analysis features are coming soon!
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
                        {uploading ? 'Uploading...' : 'Upload Interview'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Interviews;