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
    AccountTree,
    ArrowBack,
    Info,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import DocumentManager from '@/components/DocumentManager';
import { useNavigate } from 'react-router-dom';
import { categoryColors } from '@/utils/constants';
import { useAuthContext } from '@/hooks/useAuth';

const StakeholderMap: React.FC = () => {
    const navigate = useNavigate();
    const { startup } = useAuthContext();

    return (
        <>
            <Header title="Stakeholder Map" />
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
                                    <AccountTree sx={{ fontSize: 32, color: categoryColors.stakeholders }} />
                                </Box>
                                <Box>
                                    <Typography variant="h5" fontWeight="700">
                                        Stakeholder Map
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Map and analyze your key stakeholders
                                    </Typography>
                                </Box>
                            </Stack>

                            <Alert severity="info" icon={<Info />}>
                                <Typography variant="body2">
                                    Upload your stakeholder maps, analysis documents, or paste text from your workshops.
                                    These documents help you identify and understand all parties interested in or affected by your startup.
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>

                    <DocumentManager
                        category="stakeholder_map"
                        entityType={startup ? "startup" : undefined}
                        entityId={startup?.id}
                        entityField="stakeholder_map"
                        title="Stakeholder Map Documents"
                        description="Upload stakeholder maps, analysis documents, or paste workshop notes"
                        color="warning"
                    />
                </Box>
            </CenteredFlexBox>
        </>
    );
};

export default StakeholderMap;