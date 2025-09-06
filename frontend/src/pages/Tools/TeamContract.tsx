import React, { useState, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Container,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import {
    Group,
    Person,
    ArrowBack,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AssessmentStep, { AssessmentStepRef } from '@/components/AssessmentStep';
import useNotifications from '@/store/notifications';
import { CategoryEnum, categoryDisplayNames, categoryColors, categoryIcons } from '@/utils/constants';

const TeamContract: React.FC = () => {
    const navigate = useNavigate();
    const { startup, user, profile } = useAuthContext();
    const [, notificationsActions] = useNotifications();
    const isSolo = startup?.founders_count === 1;
    const [activeStep, setActiveStep] = useState(0);
    const assessmentRefs = useRef<{ [key: string]: AssessmentStepRef | null }>({});

    const teamTopics = [
        'Vision',
        'Mission',
        'Values',
        'Profiles and Roles',
        'Expectations and commitment',
        'Communication',
        'Workflow Management',
        'Founders\' agreement'
    ];

    const steps = teamTopics;

    const handleNext = async () => {
        const currentStepName = steps[activeStep];
        const currentRef = assessmentRefs.current[currentStepName];

        if (currentRef) {
            const isValid = currentRef.isValid();
            if (!isValid) {
                notificationsActions.push({
                    options: { variant: 'warning' },
                    message: 'Please answer all required questions before proceeding',
                });
                return;
            }
            await currentRef.submit();
        }

        if (activeStep === steps.length - 1) {
            // Last step - complete and navigate
            notificationsActions.push({
                options: { variant: 'success' },
                message: 'Team contract assessment completed successfully!',
            });
            navigate('/startup');
        } else {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const renderStepContent = (step: number) => {
        const currentStepName = steps[step];
        return renderTeamTopicAssessment(currentStepName);
    };

    const renderTeamTopicAssessment = (topic: string) => {
        if (!user || !startup) return null;

        return (
            <Box>
                <AssessmentStep
                    ref={(el) => { assessmentRefs.current[topic] = el; }}
                    category={CategoryEnum.team}
                    topic={topic}
                    questionType="startup"
                    startupId={startup.id}
                    surveyName="Self Assessment"
                />
            </Box>
        );
    };

    return (
        <>
            <Header title={isSolo ? "Solo Contract" : "Team Contract"} />
            <CenteredFlexBox>
                <Container maxWidth="md">
                    <Box sx={{ mb: 1, mt: 4 }}>
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
                                {isSolo ? (
                                    <Person sx={{ fontSize: 64, color: categoryColors[CategoryEnum.team], mb: 2 }} />
                                ) : (
                                    <Group sx={{ fontSize: 64, color: categoryColors[CategoryEnum.team], mb: 2 }} />
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

                            <Stepper
                                activeStep={activeStep}
                                sx={{
                                    mb: 4,
                                    '& .MuiStepLabel-label': {
                                        display: 'none'
                                    },
                                    '& .Mui-active .MuiStepIcon-root': {
                                        color: categoryColors[CategoryEnum.team]
                                    },
                                    '& .Mui-active .MuiStepIcon-text': {
                                        fill: 'white'
                                    },
                                    '& .Mui-completed .MuiStepIcon-root': {
                                        color: categoryColors[CategoryEnum.team]
                                    },
                                    '& .Mui-completed .MuiStepIcon-text': {
                                        fill: 'white'
                                    }
                                }}
                            >
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel />
                                    </Step>
                                ))}
                            </Stepper>

                            {/* Step Indicator */}
                            <Box
                                sx={{
                                    display: 'flex',
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

                            {renderStepContent(activeStep)}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                >
                                    {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            </CenteredFlexBox>
        </>
    );
};

export default TeamContract;