import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Paper,
    Alert,
    Chip
} from '@mui/material';
import {
    Slideshow,
    CloudUpload,
    Description,
    TrendingUp
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';

const PitchDeckAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploaded, setIsUploaded] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setIsUploaded(false);
        }
    };

    const handleUpload = () => {
        if (file) {
            // Handle file upload logic here
            setIsUploaded(true);
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

                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2">
                                    The Pitch Deck Analyzer is coming soon. For now, you can upload your pitch deck 
                                    to save it for future analysis.
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

                            {file && !isUploaded && (
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<CloudUpload />}
                                        onClick={handleUpload}
                                        sx={{ minWidth: 200 }}
                                    >
                                        Upload Pitch Deck
                                    </Button>
                                </Box>
                            )}

                            {isUploaded && (
                                <Alert severity="success" sx={{ mt: 3 }}>
                                    <Typography variant="body2">
                                        Your pitch deck has been uploaded successfully! 
                                        We'll notify you when the analyzer feature becomes available.
                                    </Typography>
                                </Alert>
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
        </>
    );
};

export default PitchDeckAnalyzer;