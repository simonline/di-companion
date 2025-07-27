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
} from '@mui/material';
import {
    RecordVoiceOver,
    Save,
    Analytics,
    Add,
    PlayArrow,
    Stop
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';

const InterviewAnalyzer: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [interviews, setInterviews] = useState([
        { id: 1, title: 'Customer Interview #1', date: '2024-01-15', duration: '45 min', status: 'completed' },
        { id: 2, title: 'User Feedback Session', date: '2024-01-10', duration: '30 min', status: 'analyzed' },
    ]);

    const handleStartRecording = () => {
        setIsRecording(true);
        // TODO: Implement actual recording functionality
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        // TODO: Implement actual recording stop functionality
    };

    return (
        <>
            <Header title="Interview Analyzer" />
            <CenteredFlexBox>
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        {/* Recording Section */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <RecordVoiceOver sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom fontWeight="bold">
                                            Record Interviews
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Capture customer conversations and feedback sessions
                                        </Typography>
                                    </Box>

                                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                                        <TextField
                                            fullWidth
                                            label="Interview Title"
                                            placeholder="e.g., Customer Interview #3"
                                            sx={{ mb: 2 }}
                                        />

                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                            {!isRecording ? (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<PlayArrow />}
                                                    onClick={handleStartRecording}
                                                    color="success"
                                                >
                                                    Start Recording
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Stop />}
                                                    onClick={handleStopRecording}
                                                    color="error"
                                                >
                                                    Stop Recording
                                                </Button>
                                            )}
                                        </Box>

                                        {isRecording && (
                                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                                <Typography variant="body2" color="error">
                                                    Recording in progress...
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Analysis Section */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <Analytics sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom fontWeight="bold">
                                            Analyze Insights
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Extract key insights and patterns from your interviews
                                        </Typography>
                                    </Box>

                                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                                        <Typography variant="h6" gutterBottom>
                                            Coming Soon
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            AI-powered analysis to identify common themes, pain points, and opportunities from your customer interviews.
                                        </Typography>
                                        <Button variant="contained" disabled>
                                            Analyze Interviews
                                        </Button>
                                    </Paper>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Interview List */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            Saved Interviews
                                        </Typography>
                                        <Button startIcon={<Add />} variant="outlined">
                                            New Interview
                                        </Button>
                                    </Box>

                                    <List>
                                        {interviews.map((interview, index) => (
                                            <React.Fragment key={interview.id}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={interview.title}
                                                        secondary={`${interview.date} • ${interview.duration}`}
                                                    />
                                                    <Chip
                                                        label={interview.status}
                                                        color={interview.status === 'analyzed' ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </ListItem>
                                                {index < interviews.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </CenteredFlexBox>
        </>
    );
};

export default InterviewAnalyzer; 