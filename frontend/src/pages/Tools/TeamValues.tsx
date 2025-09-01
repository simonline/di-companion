import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
} from '@mui/material';
import { Groups, ArrowBack } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useNavigate } from 'react-router-dom';

const TeamValues: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <>
            <Header title="Team Values" />
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
                <Card>
                    <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Groups sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                                Team Values Workshop
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Coming soon - Define your team&apos;s corporate value set through a collaborative process
                            </Typography>
                        </Box>

                        <Box sx={{ 
                            p: 4, 
                            bgcolor: 'background.default', 
                            borderRadius: 2,
                            textAlign: 'center' 
                        }}>
                            <Typography variant="h6" color="text.secondary">
                                This feature is under development
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                We&apos;re working on a collaborative tool to help your team define and align on shared values.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
                </Box>
            </CenteredFlexBox>
        </>
    );
};

export default TeamValues;