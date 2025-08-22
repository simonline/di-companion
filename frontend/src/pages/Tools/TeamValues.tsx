import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Container,
} from '@mui/material';
import { Groups } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';

const TeamValues: React.FC = () => {
    return (
        <>
            <Header title="Team Values" />
            <CenteredFlexBox>
                <Card>
                    <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Groups sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                                Team Values Workshop
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Coming soon - Define your team's corporate value set through a collaborative process
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
                                We're working on a collaborative tool to help your team define and align on shared values.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </CenteredFlexBox>
        </>
    );
};

export default TeamValues;