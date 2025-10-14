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
    RecordVoiceOver,
    Info,
    ArrowBack
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import DocumentManager from '@/components/DocumentManager';
import { useNavigate } from 'react-router-dom';
import { categoryColors, CategoryEnum } from '@/utils/constants';
import { useAuthContext } from '@/hooks/useAuth';

const Interviews: React.FC = () => {
    const navigate = useNavigate();
    const { startup } = useAuthContext();

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
                                    <strong>What to Upload:</strong> Interview recordings, transcripts, customer feedback documents, survey responses, or meeting notes. Supported formats: Audio (MP3, WAV), Video (MP4), Text (TXT, DOCX, PDF).
                                </Typography>
                            </Alert>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" fontWeight="600" gutterBottom>
                                    Helpful Tips for Conducting Interviews:
                                </Typography>
                                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                                    <Typography variant="body2" component="li">
                                        Try <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">Calendly</a> to schedule interviews efficiently (B2B)
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Prepare interview guideline with open-ended questions
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Plan for roughly 15 minute sessions to respect customers time
                                    </Typography>
                                    <Typography variant="body2" component="li">
                                        Use <a href="https://memoro.ai" target="_blank" rel="noopener noreferrer">Memoro.ai</a> or another app for recording and automatic transcription
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <DocumentManager
                        category={CategoryEnum.stakeholders}
                        entityType="startup"
                        entityId={startup?.id}
                        entityField="interviews"
                        title="Interviews"
                        description="Upload interview recordings, transcripts, customer feedback, or survey responses for analysis."
                    />
                </Box>
            </CenteredFlexBox>
        </>
    );
};

export default Interviews;