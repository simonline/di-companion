import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Container,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Chip,
    Grid,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Alert,
} from '@mui/material';
import { Psychology, Group, Share, ArrowBack } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useNavigate } from 'react-router-dom';

const VALUES = [
    'Agility', 'Transparency', 'Modernity', 'Mindfulness', 'Caring', 'Dignity', 'Humility',
    'Courage', 'Honesty', 'Learning', 'Integrity', 'Reliability', 'Loyalty', 'Self-esteem',
    'Risk taking', 'Openness', 'Peace', 'Intuition', 'Solidarity', 'Enthusiasm', 'Dedication',
    'Optimism', 'Freedom', 'Tolerance', 'Curiosity', 'Trust', 'Authenticity', 'Security',
    'Sustainability', 'Responsibility', 'Sense of duty', 'Generosity', 'Health', 'Joy',
    'Perfection', 'Warmth', 'Respect', 'Empathy', 'Sensitivity', 'Attention', 'Humor',
    'Austerity', 'Justice', 'Team Spirit', 'Effectiveness', 'Kindness', 'Creativity',
    'Passion', 'Control', 'Impact', 'Determination', 'Endurance', 'Consequence',
    'Efficiency', 'Winning', 'Pragmatism'
];

const UserValues: React.FC = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [top15Values, setTop15Values] = useState<string[]>([]);
    const [final7Values, setFinal7Values] = useState<string[]>([]);

    const steps = [
        'Review & Agree on Values',
        'Select Top 15 (Individual)',
        'Reduce to 7 (Shared)'
    ];

    const handleValueToggle = (value: string) => {
        setSelectedValues(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    const handleTop15Toggle = (value: string) => {
        setTop15Values(prev => {
            if (prev.includes(value)) {
                return prev.filter(v => v !== value);
            } else if (prev.length < 15) {
                return [...prev, value];
            }
            return prev;
        });
    };

    const handleFinal7Toggle = (value: string) => {
        setFinal7Values(prev => {
            if (prev.includes(value)) {
                return prev.filter(v => v !== value);
            } else if (prev.length < 7) {
                return [...prev, value];
            }
            return prev;
        });
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Step 1:</strong> Review the set of 56 values together & agree on your set!
                                Should some be added/exchanged/removed?
                            </Typography>
                        </Alert>
                        <Typography variant="h6" gutterBottom>
                            Select values that resonate with you:
                        </Typography>
                        <Grid container spacing={1}>
                            {VALUES.map((value) => (
                                <Grid item key={value}>
                                    <Chip
                                        label={value}
                                        onClick={() => handleValueToggle(value)}
                                        color={selectedValues.includes(value) ? 'primary' : 'default'}
                                        variant={selectedValues.includes(value) ? 'filled' : 'outlined'}
                                        sx={{ m: 0.5 }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Step 2:</strong> Everyone selects their 15 top values, individually (NO sharing)
                            </Typography>
                        </Alert>
                        <Typography variant="h6" gutterBottom>
                            Select your top 15 values ({top15Values.length}/15):
                        </Typography>
                        <Grid container spacing={1}>
                            {VALUES.map((value) => (
                                <Grid item key={value}>
                                    <Chip
                                        label={value}
                                        onClick={() => handleTop15Toggle(value)}
                                        color={top15Values.includes(value) ? 'primary' : 'default'}
                                        variant={top15Values.includes(value) ? 'filled' : 'outlined'}
                                        disabled={!top15Values.includes(value) && top15Values.length >= 15}
                                        sx={{ m: 0.5 }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Step 3:</strong> Everyone reduces their 15 top values down to 7 individually (SHARED AFTER)
                            </Typography>
                        </Alert>
                        <Typography variant="h6" gutterBottom>
                            Select your final 7 values ({final7Values.length}/7):
                        </Typography>
                        <Grid container spacing={1}>
                            {top15Values.map((value) => (
                                <Grid item key={value}>
                                    <Chip
                                        label={value}
                                        onClick={() => handleFinal7Toggle(value)}
                                        color={final7Values.includes(value) ? 'primary' : 'default'}
                                        variant={final7Values.includes(value) ? 'filled' : 'outlined'}
                                        disabled={!final7Values.includes(value) && final7Values.length >= 7}
                                        sx={{ m: 0.5 }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );

            default:
                return null;
        }
    };

    const handleNext = () => {
        if (activeStep === 0 && selectedValues.length === 0) {
            alert('Please select at least one value before proceeding.');
            return;
        }
        if (activeStep === 1 && top15Values.length !== 15) {
            alert('Please select exactly 15 values before proceeding.');
            return;
        }
        if (activeStep === 2 && final7Values.length !== 7) {
            alert('Please select exactly 7 values before proceeding.');
            return;
        }
        setActiveStep(prev => prev + 1);
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    return (
        <>
            <Header title="Your Values" />
            <CenteredFlexBox>
                <Box sx={{ maxWidth: 1200, width: '100%', mt: 4 }}>
                    <Box sx={{ mb: 1 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/user')}
                            sx={{ color: 'text.secondary' }}
                        >
                            Back to User
                        </Button>
                    </Box>
                <Card>
                    <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Psychology sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                                Your Values Workshop
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Define your corporate value set through a collaborative three-step process
                            </Typography>
                        </Box>

                        <Stepper
                            activeStep={activeStep}
                            sx={{
                                mb: 4,
                                '& .MuiStepLabel-label': {
                                    display: { xs: 'none', sm: 'block' }
                                },
                                '& .MuiStepLabel-iconContainer': {
                                    paddingRight: { xs: 0, sm: 2 }
                                }
                            }}
                        >
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: activeStep === steps.indexOf(label) ? 'bold' : 'normal',
                                                display: { xs: 'none', sm: 'block' }
                                            }}
                                        >
                                            {label}
                                        </Typography>
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {/* Mobile Step Indicator */}
                        <Box
                            sx={{
                                display: { xs: 'flex', sm: 'none' },
                                justifyContent: 'center',
                                alignItems: 'center',
                                mb: 4,
                                gap: 1
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Step {activeStep + 1} of {steps.length}:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {steps[activeStep]}
                            </Typography>
                        </Box>

                        {renderStepContent()}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={activeStep === steps.length - 1}
                            >
                                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
                </Box>
            </CenteredFlexBox>
        </>
    );
};

export default UserValues; 