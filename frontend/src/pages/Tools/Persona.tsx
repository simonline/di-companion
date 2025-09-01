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
    Person,
    Info,
    ArrowBack
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import DocumentManager from '@/components/DocumentManager';
import { useNavigate } from 'react-router-dom';
import { categoryColors } from '@/utils/constants';
import { useAuthContext } from '@/hooks/useAuth';

const Persona: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthContext();

    return (
        <>
            <Header title="User Personas" />
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
                                    <Person sx={{ color: categoryColors.stakeholders, fontSize: 28 }} />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" fontWeight="700">
                                        Persona
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Upload your personas for future analysis
                                    </Typography>
                                </Box>
                            </Stack>

                            <Alert
                                severity="info"
                                sx={{
                                    mb: 3,
                                    bgcolor: `${categoryColors.stakeholders}08`,
                                    borderLeft: `4px solid ${categoryColors.stakeholders}`,
                                }}
                                icon={<Info sx={{ color: categoryColors.stakeholders }} />}
                            >
                                <Typography variant="body2">
                                    <strong>What to Upload:</strong> User persona documents, customer profiles, user journey maps, or demographic research. Supported formats: PDF, PNG, JPG, PowerPoint, Word documents.
                                </Typography>
                            </Alert>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" fontWeight="600" gutterBottom>
                                    Helpful Tips for Creating Your User Personas:
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                                    <Typography variant="body2" component="li">
                                        Use <a href="https://xtensio.com" target="_blank" rel="noopener noreferrer">Xtensio</a> or <a href="https://www.hubspot.com/make-my-persona" target="_blank" rel="noopener noreferrer">HubSpot's Make My Persona</a> for templates
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Try <a href="https://smaply.com" target="_blank" rel="noopener noreferrer">Smaply</a> for journey mapping with personas
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Base personas on real user research data
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Limit to 3-5 primary personas for focus
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Include goals, pain points, and behaviors
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <DocumentManager
                        category="persona"
                        title="User Personas"
                        description="Upload user persona documents, customer profiles, or demographic research for analysis."
                        color="stakeholders"
                    />
                </Box>
            </CenteredFlexBox>
        </>
    );
};

export default Persona;