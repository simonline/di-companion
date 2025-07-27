import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Container,
    Paper,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Alert,
} from '@mui/material';
import {
    Slideshow,
    Upload,
    Analytics,
    CheckCircle,
    Warning,
    Error,
    CloudUpload
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';

const PitchDeckAnalyzer: React.FC = () => {
    const [uploadedDecks, setUploadedDecks] = useState([
        {
            id: 1,
            title: 'Series A Pitch Deck',
            date: '2024-01-15',
            status: 'analyzed',
            score: 85,
            feedback: [
                'Strong problem statement',
                'Clear value proposition',
                'Market size could be better defined',
                'Competitive analysis needs improvement'
            ]
        },
        {
            id: 2,
            title: 'Seed Round Deck',
            date: '2024-01-10',
            status: 'pending',
            score: null,
            feedback: []
        },
    ]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // TODO: Implement actual file upload and analysis
            console.log('File uploaded:', file.name);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Needs Improvement';
    };

    return (
        <>
            <Header title="Pitch Deck Analyzer" />
            <CenteredFlexBox>
                <Container maxWidth="lg">
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Slideshow sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    Pitch Deck Analyzer
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Get AI-powered feedback and analysis on your pitch deck presentations
                                </Typography>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Upload Section */}
                                <Grid item xs={12} md={6}>
                                    <Paper
                                        sx={{
                                            p: 4,
                                            mb: 3,
                                            bgcolor: 'background.default',
                                            border: '2px dashed',
                                            borderColor: 'grey.300',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Drop your pitch deck here
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Supports PDF, PowerPoint, and Keynote files
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            component="label"
                                            startIcon={<Upload />}
                                        >
                                            Choose File
                                            <input
                                                type="file"
                                                hidden
                                                accept=".pdf,.ppt,.pptx,.key"
                                                onChange={handleFileUpload}
                                            />
                                        </Button>
                                    </Paper>
                                </Grid>

                                {/* Analysis Features */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                                            <Analytics sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                                Analysis Features
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Comprehensive evaluation of your pitch deck
                                            </Typography>
                                        </Box>

                                        <List>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircle color="success" />
                                                </ListItemIcon>
                                                <ListItemText primary="Structure & Flow" />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircle color="success" />
                                                </ListItemIcon>
                                                <ListItemText primary="Content Quality" />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircle color="success" />
                                                </ListItemIcon>
                                                <ListItemText primary="Visual Design" />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircle color="success" />
                                                </ListItemIcon>
                                                <ListItemText primary="Investor Readiness" />
                                            </ListItem>
                                        </List>
                                    </Paper>
                                </Grid>

                                {/* Analysis Results */}
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Analysis Results
                                        </Typography>

                                        {uploadedDecks.map((deck) => (
                                            <Paper key={deck.id} sx={{ p: 3, mb: 2 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="h6">{deck.title}</Typography>
                                                    <Chip
                                                        label={deck.status}
                                                        color={deck.status === 'analyzed' ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </Box>

                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    Uploaded on {deck.date}
                                                </Typography>

                                                {deck.status === 'analyzed' && deck.score && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                            <Typography variant="h4" color={`${getScoreColor(deck.score)}.main`}>
                                                                {deck.score}%
                                                            </Typography>
                                                            <Chip
                                                                label={getScoreLabel(deck.score)}
                                                                color={getScoreColor(deck.score) as any}
                                                                size="small"
                                                            />
                                                        </Box>

                                                        <Typography variant="h6" gutterBottom>
                                                            Key Feedback:
                                                        </Typography>
                                                        <List dense>
                                                            {deck.feedback.map((item, index) => (
                                                                <ListItem key={index} sx={{ py: 0.5 }}>
                                                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                                                        {item.includes('needs') || item.includes('could') ? (
                                                                            <Warning color="warning" fontSize="small" />
                                                                        ) : (
                                                                            <CheckCircle color="success" fontSize="small" />
                                                                        )}
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={item} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Box>
                                                )}

                                                {deck.status === 'pending' && (
                                                    <Alert severity="info">
                                                        Analysis in progress. This may take a few minutes.
                                                    </Alert>
                                                )}
                                            </Paper>
                                        ))}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Container>
            </CenteredFlexBox>
        </>
    );
};

export default PitchDeckAnalyzer; 