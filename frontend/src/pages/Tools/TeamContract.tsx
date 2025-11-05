import React, { useState, useRef, useEffect } from 'react';
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
    Summarize,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AssessmentStep, { AssessmentStepRef } from '@/components/AssessmentStep';
import useNotifications from '@/store/notifications';
import { CategoryEnum, categoryColors } from '@/utils/constants';
import AssessmentSummary from '@/components/AssessmentSummary';
import { supabaseGetQuestions } from '@/lib/supabase';
import useStartupQuestions from '@/hooks/useStartupQuestions';
import { Question } from '@/types/database';

const TeamContract: React.FC = () => {
    const navigate = useNavigate();
    const { startup, user, updateStartup } = useAuthContext();
    const [, notificationsActions] = useNotifications();
    const isSolo = startup?.founders_count === 1;
    const [activeStep, setActiveStep] = useState(0);
    const assessmentRefs = useRef<{ [key: string]: AssessmentStepRef | null }>({});
    const [summaryOpen, setSummaryOpen] = useState(false);

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

    // Fetch all questions and answers for summary (across all topics)
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const { fetchStartupQuestions, startupQuestions } = useStartupQuestions();

    useEffect(() => {
        const fetchAllQuestions = async () => {
            try {
                // Fetch questions for all topics in parallel
                const questionPromises = teamTopics.map(topic =>
                    supabaseGetQuestions(CategoryEnum.team, topic)
                );
                const questionArrays = await Promise.all(questionPromises);

                // Flatten all questions into a single array
                const flattenedQuestions = questionArrays.flat();
                setAllQuestions(flattenedQuestions);
            } catch (error) {
                console.error('Failed to fetch all questions:', error);
            }
        };

        if (startup?.id) {
            fetchAllQuestions();
            fetchStartupQuestions(startup.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startup?.id]);

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
            // Last step - mark progress and navigate
            if (startup) {
                await updateStartup({
                    id: startup.id,
                    progress: {
                        ...startup.progress,
                        'team-contract': true
                    }
                });
            }

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

    const handleStepClick = (step: number) => {
        setActiveStep(step);
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

    const handleOpenSummary = () => {
        // Refetch latest data before opening summary
        if (startup?.id) {
            fetchStartupQuestions(startup.id);
        }
        setSummaryOpen(true);
    };

    return (
        <>
            <Header title={isSolo ? "Solo Contract" : "Team Contract"} />
            <CenteredFlexBox>
                <Container maxWidth="md">
                    <Box sx={{ mb: 1, mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/startup')}
                            sx={{ color: 'text.secondary' }}
                        >
                            Back to Startup
                        </Button>
                        <Button
                            startIcon={<Summarize />}
                            onClick={handleOpenSummary}
                            sx={{ color: 'text.secondary' }}
                        >
                            Summary
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
                                nonLinear
                                sx={{
                                    mb: 4,
                                    '& .MuiStepLabel-label': {
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    },
                                    '& .MuiStepButton-root': {
                                        cursor: 'pointer'
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
                                    },
                                    '& .MuiStepIcon-root': {
                                        cursor: 'pointer'
                                    }
                                }}
                            >
                                {steps.map((label, index) => (
                                    <Step key={label}>
                                        <StepLabel
                                            onClick={() => handleStepClick(index)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            {label}
                                        </StepLabel>
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
                                    sx={{ 
                                        backgroundColor: categoryColors[CategoryEnum.team],
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: categoryColors[CategoryEnum.team],
                                            filter: 'brightness(0.9)'
                                        }
                                    }}
                                >
                                    {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            </CenteredFlexBox>

            {/* Assessment Summary Dialog - outside Container for proper modal behavior */}
            {allQuestions.length > 0 && startupQuestions && (
                <AssessmentSummary
                    open={summaryOpen}
                    onClose={() => setSummaryOpen(false)}
                    title={isSolo ? 'Solo Contract' : 'Team Contract'}
                    subtitle={isSolo
                        ? 'Define your personal commitment and goals for your startup journey'
                        : 'Establish clear agreements and commitments with your team members'}
                    questions={allQuestions}
                    answers={startupQuestions}
                    metadata={{ startup: startup?.name || undefined }}
                />
            )}
        </>
    );
};

export default TeamContract;