import React, { useState } from 'react';
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
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';

interface Interview {
    id: number;
    title: string;
    date: string;
    duration: string;
    status: 'processing' | 'completed' | 'analyzed';
    file?: File;
    transcription?: string;
    summary?: string;
    insights?: string[];
    tags?: string[];
    language?: string;
    mode?: string;
}

const InterviewAnalyzer: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [interviews, setInterviews] = useState<Interview[]>([
        {
            id: 1,
            title: 'Customer Interview #1',
            date: '2024-01-15',
            duration: '45 min',
            status: 'analyzed',
            transcription: 'Interviewer: Hello, thank you for joining us today. Could you tell us about your experience with our product?\n\nCustomer: Sure! I\'ve been using it for about 3 months now. Overall, I find it quite useful, especially the dashboard feature. However, I sometimes struggle with the mobile app interface...',
            summary: 'Customer has been using the product for 3 months. Positive feedback on dashboard feature, but mobile app interface needs improvement. Overall satisfaction is good.',
            insights: ['Dashboard feature is well-received', 'Mobile app interface needs improvement', 'Customer is generally satisfied'],
            tags: ['customer-feedback', 'product-review', 'mobile-app'],
            language: 'English',
            mode: 'Meeting Minutes'
        },
        {
            id: 2,
            title: 'User Feedback Session',
            date: '2024-01-10',
            duration: '30 min',
            status: 'completed',
            transcription: 'Moderator: Welcome everyone to our feedback session. Let\'s start with the onboarding process. What was your first impression?\n\nUser 1: The onboarding was straightforward, but I wish there were more examples...',
            summary: 'Users found onboarding straightforward but wanted more examples. Several suggestions for improving the tutorial flow.',
            insights: ['Onboarding is clear but needs more examples', 'Tutorial flow could be improved', 'Users want more guidance'],
            tags: ['onboarding', 'tutorial', 'user-feedback'],
            language: 'English',
            mode: 'Focus Group'
        },
    ]);

    const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleUploadInterview = () => {
        if (uploadFile && uploadTitle) {
            const newInterview: Interview = {
                id: Date.now(),
                title: uploadTitle,
                date: new Date().toISOString().split('T')[0],
                duration: 'Unknown',
                status: 'processing',
                file: uploadFile,
                language: 'Auto-detected',
                mode: 'General'
            };
            setInterviews([newInterview, ...interviews]);
            setUploadDialogOpen(false);
            setUploadFile(null);
            setUploadTitle('');

            // Simulate processing
            setTimeout(() => {
                setInterviews(prev => prev.map(interview =>
                    interview.id === newInterview.id
                        ? { ...interview, status: 'completed' }
                        : interview
                ));
            }, 3000);
        }
    };

    const handleEditInterview = (interview: Interview) => {
        setSelectedInterview(interview);
        setEditDialogOpen(true);
    };

    const handleDeleteInterview = (id: number) => {
        setInterviews(interviews.filter(interview => interview.id !== id));
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

                            {/* Memoro.ai Integration Banner */}
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2">
                                    This tool is powered by <strong>Memoro.ai</strong> - Intelligent conversation transcription and analysis.
                                    <Button
                                        href="https://www.memoro.ai/en"
                                        target="_blank"
                                        size="small"
                                        sx={{ ml: 1 }}
                                    >
                                        Learn More
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
                                            Memoro.ai provides automatic transcription, summarization, and key insights extraction from your interview recordings.
                                        </Typography>
                                        <Button variant="contained" disabled>
                                            Analyze Interviews
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

                                        <List>
                                            {interviews.map((interview, index) => (
                                                <React.Fragment key={interview.id}>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={interview.title}
                                                            secondary={`${interview.date} • ${interview.duration} • ${interview.language} • ${interview.mode}`}
                                                        />
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip
                                                                label={interview.status}
                                                                color={
                                                                    interview.status === 'analyzed' ? 'success' :
                                                                        interview.status === 'completed' ? 'primary' :
                                                                            interview.status === 'processing' ? 'warning' : 'default'
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
                                            ))}
                                        </List>
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
                    />
                    <input
                        accept="audio/*"
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
                            Choose Audio File
                        </Button>
                    </label>
                    {uploadFile && (
                        <Typography variant="body2" color="text.secondary">
                            Selected: {uploadFile.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleUploadInterview}
                        variant="contained"
                        disabled={!uploadFile || !uploadTitle}
                    >
                        Upload & Analyze
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
                                        value={selectedInterview.title}
                                        sx={{ mb: 2 }}
                                    />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Language"
                                                value={selectedInterview.language}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Mode"
                                                value={selectedInterview.mode}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {selectedTab === 1 && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={10}
                                    label="Transcription"
                                    value={selectedInterview.transcription || 'No transcription available'}
                                    InputProps={{ readOnly: true }}
                                />
                            )}

                            {selectedTab === 2 && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={6}
                                    label="Summary"
                                    value={selectedInterview.summary || 'No summary available'}
                                    InputProps={{ readOnly: true }}
                                />
                            )}

                            {selectedTab === 3 && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Key Insights</Typography>
                                    {selectedInterview.insights ? (
                                        <List>
                                            {selectedInterview.insights.map((insight, index) => (
                                                <ListItem key={index}>
                                                    <ListItemText primary={insight} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">No insights available</Typography>
                                    )}

                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Tags</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {selectedInterview.tags?.map((tag, index) => (
                                            <Chip key={index} label={tag} size="small" />
                                        )) || <Typography color="text.secondary">No tags</Typography>}
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