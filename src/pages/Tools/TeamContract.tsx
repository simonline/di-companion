import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Container,
    Paper,
} from '@mui/material';
import { Description, Group, Person } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';

const TeamContract: React.FC = () => {
    const { startup } = useAuthContext();
    const isSolo = startup?.foundersCount === 1;

    return (
        <>
            <Header title={isSolo ? "Solo Contract" : "Team Contract"} />
            <CenteredFlexBox>
                <Container maxWidth="md">
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                {isSolo ? (
                                    <Person sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                ) : (
                                    <Group sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                                )}
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    {isSolo ? "Solo Contract" : "Team Contract"}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {isSolo
                                        ? "Define your personal commitment and goals for your startup journey."
                                        : "Establish clear agreements and commitments with your team members."
                                    }
                                </Typography>
                            </Box>

                            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                                <Typography variant="h6" gutterBottom fontWeight="600">
                                    Coming Soon
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    This tool will help you {isSolo ? "create a personal contract" : "establish team agreements"}
                                    covering roles, responsibilities, equity distribution, and commitment levels.
                                </Typography>
                                <Button variant="contained" disabled>
                                    Launch Tool
                                </Button>
                            </Paper>
                        </CardContent>
                    </Card>
                </Container>
            </CenteredFlexBox>
        </>
    );
};

export default TeamContract; 