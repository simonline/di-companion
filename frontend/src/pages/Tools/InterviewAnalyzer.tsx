import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Container,
    Paper,
    TextField,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemText,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Alert,
    Tabs,
    Tab,
    CircularProgress,
} from '@mui/material';
import {
    RecordVoiceOver,
    Save,
    Analytics,
    Add,
    Upload,
    MoreVert,
    Edit,
    Delete,
    Download,
    Share,
    CloudUpload,
    Info,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';

interface Interview {
    id: number;
    attributes: {
        title: string;
        description?: string;
        type: string;
        status: 'uploaded' | 'processing' | 'completed' | 'analyzed' | 'failed';
        file?: {
            data?: {
                id: number;
                attributes: {
                    url: string;
                    name: string;
                    size: number;
                    ext: string;
                };
            };
        };
        transcription?: string;
        summary?: string;
        insights?: any;
        tags?: any;
        language?: string;
        mode?: string;
        duration?: string;
        createdAt: string;
        updatedAt: string;
    };
}

const InterviewAnalyzer: React.FC = () => {
    const { user } = useAuth();
    const [selectedTab, setSelectedTab] = useState(0);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Fetch interviews on mount
    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/document-uploads', {
                params: {
                    filters: {
                        type: 'interview'
                    },
                    populate: 'file',
                    sort: 'createdAt:desc'
                }
            });
            setInterviews(response.data.data || []);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUploadInterview = async () => {
        if (uploadFile && uploadTitle) {
            setUploading(true);
            try {
                // First upload the file
                const formData = new FormData();
                formData.append('files', uploadFile);
                
                const fileResponse = await axiosInstance.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const uploadedFile = fileResponse.data[0];

                // Then create the document upload entry
                const documentData = {
                    data: {
                        title: uploadTitle,
                        description: uploadDescription,
                        type: 'interview',
                        status: 'uploaded',
                        file: uploadedFile.id,
                        language: 'auto-detected',
                        mode: 'General',
                    }
                };

                await axiosInstance.post('/api/document-uploads', documentData);

                // Refresh the list
                await fetchInterviews();

                // Reset form
                setUploadDialogOpen(false);
                setUploadFile(null);
                setUploadTitle('');
                setUploadDescription('');
            } catch (error) {
                console.error('Error uploading interview:', error);
                alert('Failed to upload interview. Please try again.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleEditInterview = (interview: Interview) => {
        setSelectedInterview(interview);
        setEditDialogOpen(true);
    };

    const handleDeleteInterview = async (id: number) => {
        try {
            await axiosInstance.delete(`/api/document-uploads/${id}`);
            await fetchInterviews();
        } catch (error) {
            console.error('Error deleting interview:', error);
            alert('Failed to delete interview. Please try again.');
        }
        setAnchorEl(null);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, interview: Interview) => {
        setAnchorEl(event.currentTarget);
        setSelectedInterview(interview);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <>
            <Header title="Interview Analyzer" />
            <CenteredFlexBox>
                <Container maxWidth="lg">
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <RecordVoiceOver sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    Interview Analyzer
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Upload interview recordings and get AI-powered transcription, summarization, and insights powered by Memoro.ai
                                </Typography>
                            </Box>

                            {/* Coming Soon Banner */}
                            <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
                                <Typography variant="body2">
                                    <strong>Analyzer Coming Soon!</strong> Currently, you can upload and store your interview files. 
                                    The AI-powered transcription and analysis features will be available soon, powered by <strong>Memoro.ai</strong>.
                                    <Button
                                        href="https://www.memoro.ai/en"
                                        target="_blank"
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        Learn More about Memoro.ai
                                    </Button>
                                </Typography>
                            </Alert>

                            <Grid container spacing={3}>
                                {/* Upload Section */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                                            <CloudUpload sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                                Upload Interview Audio
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Upload existing audio files for Memoro.ai analysis
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Supported formats: MP3, WAV, M4A, and more. Memoro.ai will transcribe and analyze your audio files.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<Upload />}
                                            onClick={() => setUploadDialogOpen(true)}
                                            fullWidth
                                        >
                                            Upload Audio File
                                        </Button>
                                    </Paper>
                                </Grid>

                                {/* Analysis Section */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                                            <Analytics sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                                AI-Powered Analysis
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Get intelligent insights from your interviews
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Memoro.ai will provide automatic transcription, summarization, and key insights extraction from your interview recordings.
                                        </Typography>
                                        <Button variant="contained" disabled>
                                            Analyzer Coming Soon
                                        </Button>
                                    </Paper>
                                </Grid>

                                {/* Interview List */}
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                Your Interviews
                                            </Typography>
                                            <Button startIcon={<Add />} variant="outlined" onClick={() => setUploadDialogOpen(true)}>
                                                New Interview
                                            </Button>
                                        </Box>

                                        {loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : interviews.length > 0 ? (
                                            <List>
                                                {interviews.map((interview, index) => {
                                                    const attrs = interview.attributes;
                                                    const date = new Date(attrs.createdAt).toLocaleDateString();
                                                    return (
                                                        <React.Fragment key={interview.id}>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary={attrs.title}
                                                                    secondary={`${date} • ${attrs.duration || 'Duration TBD'} • ${attrs.language || 'Auto-detected'} • ${attrs.mode || 'General'}`}
                                                                />
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Chip
                                                                        label={attrs.status}
                                                                        color={
                                                                            attrs.status === 'analyzed' ? 'success' :
                                                                                attrs.status === 'completed' ? 'primary' :
                                                                                    attrs.status === 'processing' ? 'warning' : 
                                                                                        attrs.status === 'uploaded' ? 'info' : 'default'
                                                                        }
                                                                        size="small"
                                                                    />
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => handleMenuClick(e, interview)}
                                                                    >
                                                                        <MoreVert />
                                                                    </IconButton>
                                                                </Box>
                                                            </ListItem>
                                                            {index < interviews.length - 1 && <Divider />}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                                No interviews uploaded yet. Click "New Interview" to get started.
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Container>
            </CenteredFlexBox>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Interview Audio</DialogTitle>
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
                        rows={2}
                        sx={{ mb: 2 }}
                    />
                    <input
                        accept="audio/*,video/*"
                        style={{ display: 'none' }}
                        id="audio-file-upload"
                        type="file"
                        onChange={handleUploadFile}
                    />
                    <label htmlFor="audio-file-upload">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<Upload />}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Choose Audio/Video File
                        </Button>
                    </label>
                    {uploadFile && (
                        <Typography variant="body2" color="text.secondary">
                            Selected: {uploadFile.name}
                        </Typography>
                    )}
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                            Note: Files will be stored for future analysis. The AI transcription and analysis features are coming soon!
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setUploadDialogOpen(false);
                        setUploadFile(null);
                        setUploadTitle('');
                        setUploadDescription('');
                    }} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUploadInterview}
                        variant="contained"
                        disabled={!uploadFile || !uploadTitle || uploading}
                        startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
                    >
                        {uploading ? 'Uploading...' : 'Upload Interview'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Interview Details</DialogTitle>
                <DialogContent>
                    {selectedInterview && (
                        <Box sx={{ mt: 1 }}>
                            <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                                <Tab label="Details" />
                                <Tab label="Transcription" />
                                <Tab label="Summary" />
                                <Tab label="Insights" />
                            </Tabs>

                            {selectedTab === 0 && (
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        value={selectedInterview.attributes.title}
                                        sx={{ mb: 2 }}
                                        InputProps={{ readOnly: true }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        value={selectedInterview.attributes.description || 'No description'}
                                        sx={{ mb: 2 }}
                                        multiline
                                        rows={2}
                                        InputProps={{ readOnly: true }}
                                    />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Language"
                                                value={selectedInterview.attributes.language || 'Auto-detected'}
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Status"
                                                value={selectedInterview.attributes.status}
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                    </Grid>
                                    {selectedInterview.attributes.file?.data && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>File Information</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Name: {selectedInterview.attributes.file.data.attributes.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Size: {(selectedInterview.attributes.file.data.attributes.size / 1024 / 1024).toFixed(2)} MB
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {selectedTab === 1 && (
                                <Box>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Transcription will be available once the analyzer feature is launched.
                                    </Alert>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={10}
                                        label="Transcription"
                                        value={selectedInterview.attributes.transcription || 'Transcription not yet available - analyzer coming soon!'}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Box>
                            )}

                            {selectedTab === 2 && (
                                <Box>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Summary will be generated once the analyzer feature is launched.
                                    </Alert>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        label="Summary"
                                        value={selectedInterview.attributes.summary || 'Summary not yet available - analyzer coming soon!'}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Box>
                            )}

                            {selectedTab === 3 && (
                                <Box>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        AI insights will be generated once the analyzer feature is launched.
                                    </Alert>
                                    <Typography variant="h6" gutterBottom>Key Insights</Typography>
                                    {selectedInterview.attributes.insights && Array.isArray(selectedInterview.attributes.insights) ? (
                                        <List>
                                            {selectedInterview.attributes.insights.map((insight: string, index: number) => (
                                                <ListItem key={index}>
                                                    <ListItemText primary={insight} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">Insights not yet available - analyzer coming soon!</Typography>
                                    )}

                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Tags</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {selectedInterview.attributes.tags && Array.isArray(selectedInterview.attributes.tags) ? (
                                            selectedInterview.attributes.tags.map((tag: string, index: number) => (
                                                <Chip key={index} label={tag} size="small" />
                                            ))
                                        ) : (
                                            <Typography color="text.secondary">No tags yet</Typography>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
                    <Button variant="contained" startIcon={<Download />}>
                        Export
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => { handleEditInterview(selectedInterview!); handleMenuClose(); }}>
                    <ListItemIcon>
                        <Edit fontSize="small" />
                    </ListItemIcon>
                    View Details
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    Download
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <Share fontSize="small" />
                    </ListItemIcon>
                    Share
                </MenuItem>
                <MenuItem
                    onClick={() => { handleDeleteInterview(selectedInterview!.id); }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon>
                        <Delete fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>
        </>
    );
};

export default InterviewAnalyzer; 