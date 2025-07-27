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
                    <Grid container spacing={3}>
                        {/* Upload Section */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <Slideshow sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom fontWeight="bold">
                                            Upload Pitch Deck
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Get AI-powered feedback on your presentation
                                        </Typography>
                                    </Box>

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
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Analysis Features */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <Analytics sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
                                        <Typography variant="h5" gutterBottom fontWeight="bold">
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
                                            <ListItemText
                                                primary="Structure & Flow"
                                                secondary="Evaluate slide organization and narrative flow"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Content Quality"
                                                secondary="Assess clarity, completeness, and persuasiveness"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Visual Design"
                                                secondary="Review layout, typography, and visual appeal"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Investor Readiness"
                                                secondary="Check alignment with investor expectations"
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Analysis Results */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
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
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </CenteredFlexBox>
        </>
    );
};

export default PitchDeckAnalyzer; 