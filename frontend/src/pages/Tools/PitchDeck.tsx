import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Alert,
} from '@mui/material';
import {
    Slideshow,
    Info,
    ArrowBack
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import DocumentManager from '@/components/DocumentManager';
import { useNavigate } from 'react-router-dom';
import { categoryColors } from '@/utils/constants';
import { useAuthContext } from '@/hooks/useAuth';

const PitchDeck: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthContext();

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

                            <Alert
                                severity="info"
                                sx={{
                                    mb: 3,
                                    bgcolor: `${categoryColors.product}08`,
                                    borderLeft: `4px solid ${categoryColors.product}`,
                                }}
                                icon={<Info sx={{ color: categoryColors.product }} />}
                            >
                                <Typography variant="body2">
                                    <strong>What to Upload:</strong> Pitch deck presentations, investor decks, demo slides, or business presentations. Supported formats: PDF, PowerPoint (.ppt, .pptx), Keynote (.key).
                                </Typography>
                            </Alert>

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
                        </CardContent>
                    </Card>

                    <DocumentManager
                        category="pitch_deck"
                        title="Pitch Deck"
                        description="Upload pitch deck presentations, investor decks, or business presentations for analysis."
                        color="product"
                    />
                </Box>
            </CenteredFlexBox>
        </>
    );
};

export default PitchDeck;