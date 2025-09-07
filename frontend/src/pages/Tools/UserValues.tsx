import React, { useState, useEffect } from 'react';
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    FormControl,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import { Psychology, Group, Share, ArrowBack, EmojiEvents } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import useUserMethod from '@/hooks/useUserMethod';
import { UserValuesData } from '@/types/database';
import { categoryColors } from '@/utils/constants';

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

const USER_VALUES_METHOD_NAME = 'User Values';

const UserValues: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, startup, updateProfile } = useAuthContext();
    const {
        userMethod,
        method,
        valuesData,
        loading,
        fetchOrCreateUserMethod,
        saveValuesData
    } = useUserMethod();

    const [activeStep, setActiveStep] = useState(0);
    const [top15Values, setTop15Values] = useState<string[]>([]);
    const [final7Values, setFinal7Values] = useState<string[]>([]);
    const [pairwiseChoices, setPairwiseChoices] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    // Load existing data on mount
    useEffect(() => {
        if (user?.id) {
            fetchOrCreateUserMethod(user.id, USER_VALUES_METHOD_NAME, startup?.id);
        }
    }, [user?.id, startup?.id]);

    // Populate state when data is loaded
    useEffect(() => {
        if (valuesData) {
            setTop15Values(valuesData.top15Values || []);
            setFinal7Values(valuesData.final7Values || []);
            setPairwiseChoices(valuesData.pairwiseChoices || {});
        }
    }, [valuesData]);

    const steps = [
        'Select Top 15 (Individual)',
        'Reduce to 7 (Shared)',
        'Prioritize Your Values'
    ];


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

    const handlePairwiseChoice = (row: string, col: string, winner: string) => {
        const key = `${row}-${col}`;
        const reverseKey = `${col}-${row}`;

        setPairwiseChoices(prev => ({
            ...prev,
            [key]: winner,
            [reverseKey]: winner
        }));
    };

    const calculateValueScores = () => {
        const scores: { [key: string]: number } = {};

        // Initialize scores
        final7Values.forEach(value => {
            scores[value] = 0;
        });

        // Count wins
        Object.values(pairwiseChoices).forEach(winner => {
            if (scores[winner] !== undefined) {
                scores[winner]++;
            }
        });

        // Sort by score (descending)
        return Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .map(([value, score]) => ({ value, score }));
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <Box>
                        <Alert
                            severity="info"
                            sx={{
                                mb: 3,
                                bgcolor: `${categoryColors.entrepreneur}08`,
                                borderLeft: `4px solid ${categoryColors.entrepreneur}`,
                                '& .MuiAlert-icon': { color: categoryColors.entrepreneur }
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Step 1:</strong> Everyone selects their 15 top values, individually (NO sharing)
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
                                        color={top15Values.includes(value) ? 'entrepreneur' : 'default'}
                                        variant={top15Values.includes(value) ? 'filled' : 'outlined'}
                                        disabled={!top15Values.includes(value) && top15Values.length >= 15}
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
                        <Alert
                            severity="info"
                            sx={{
                                mb: 3,
                                bgcolor: `${categoryColors.entrepreneur}08`,
                                borderLeft: `4px solid ${categoryColors.entrepreneur}`,
                                '& .MuiAlert-icon': { color: categoryColors.entrepreneur }
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Step 2:</strong> Everyone reduces their 15 top values down to 7 individually (SHARED AFTER)
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
                                        color={final7Values.includes(value) ? 'entrepreneur' : 'default'}
                                        variant={final7Values.includes(value) ? 'filled' : 'outlined'}
                                        disabled={!final7Values.includes(value) && final7Values.length >= 7}
                                        sx={{ m: 0.5 }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                );

            case 2:
                const valueScores = calculateValueScores();
                return (
                    <Box>
                        <Alert
                            severity="info"
                            sx={{
                                mb: 3,
                                bgcolor: `${categoryColors.entrepreneur}08`,
                                borderLeft: `4px solid ${categoryColors.entrepreneur}`,
                                '& .MuiAlert-icon': { color: categoryColors.entrepreneur }
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Step 3: Forced Choice Prioritization</strong>
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Compare each pair of values and select which one is more important to you.
                                Fill out only the white cells in the upper triangle of the matrix.
                            </Typography>
                        </Alert>

                        {/* Pairwise Comparison Matrix */}
                        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Value Comparison Matrix
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                For each white cell, select which value (row vs column) is more important
                            </Typography>

                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small" sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>Values</TableCell>
                                            {final7Values.map((colValue) => (
                                                <TableCell
                                                    key={colValue}
                                                    align="center"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        bgcolor: 'grey.100',
                                                        textOrientation: 'mixed',
                                                        p: 1,
                                                        minWidth: 80
                                                    }}
                                                >
                                                    {colValue}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {final7Values.map((rowValue, rowIndex) => (
                                            <TableRow key={rowValue}>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                                                    {rowValue}
                                                </TableCell>
                                                {final7Values.map((colValue, colIndex) => {
                                                    const key = `${rowValue}-${colValue}`;
                                                    const reverseKey = `${colValue}-${rowValue}`;
                                                    const isDiagonal = rowIndex === colIndex;
                                                    const isUpperTriangle = rowIndex < colIndex;
                                                    const isLowerTriangle = rowIndex > colIndex;

                                                    if (isDiagonal) {
                                                        return (
                                                            <TableCell
                                                                key={colValue}
                                                                align="center"
                                                                sx={{ bgcolor: 'grey.300', color: 'grey.600' }}
                                                            >
                                                                —
                                                            </TableCell>
                                                        );
                                                    }

                                                    if (isUpperTriangle) {
                                                        return (
                                                            <TableCell key={colValue} align="center" sx={{ bgcolor: 'background.paper', p: 1 }}>
                                                                <FormControl size="small" fullWidth>
                                                                    <Select
                                                                        value={pairwiseChoices[key] || ''}
                                                                        onChange={(e) => handlePairwiseChoice(rowValue, colValue, e.target.value)}
                                                                        displayEmpty
                                                                        sx={{ minWidth: 70 }}
                                                                    >
                                                                        <MenuItem value="">
                                                                            <em>Choose</em>
                                                                        </MenuItem>
                                                                        <MenuItem value={rowValue}>{rowValue}</MenuItem>
                                                                        <MenuItem value={colValue}>{colValue}</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </TableCell>
                                                        );
                                                    }

                                                    // Lower triangle - show the mirrored result
                                                    return (
                                                        <TableCell
                                                            key={colValue}
                                                            align="center"
                                                            sx={{
                                                                bgcolor: 'grey.50',
                                                                color: pairwiseChoices[reverseKey] ? 'text.primary' : 'text.disabled'
                                                            }}
                                                        >
                                                            {pairwiseChoices[reverseKey] || '—'}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                        {/* Value Rankings */}
                        <Paper elevation={2} sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmojiEvents sx={{ color: 'gold', mr: 1 }} />
                                <Typography variant="h6">
                                    Value Priority Ranking
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Based on your pairwise comparisons (higher score = more wins)
                            </Typography>

                            <List>
                                {valueScores.map(({ value, score }, index) => (
                                    <React.Fragment key={value}>
                                        <ListItem
                                            sx={{
                                                bgcolor: index === 0 ? 'primary.50' : 'background.paper',
                                                borderRadius: 1,
                                                mb: 0.5
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    mr: 2,
                                                                    color: index < 3 ? 'entrepreneur.main' : 'text.secondary',
                                                                    fontWeight: index === 0 ? 'bold' : 'normal'
                                                                }}
                                                            >
                                                                #{index + 1}
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'medium'}>
                                                                {value}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label={`${score} win${score !== 1 ? 's' : ''}`}
                                                            size="small"
                                                            color={index === 0 ? 'entrepreneur' : 'default'}
                                                            variant={index < 3 ? 'filled' : 'outlined'}
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < valueScores.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Box>
                );

            default:
                return null;
        }
    };

    const saveProgress = async () => {
        if (!user?.id || !userMethod) return;

        setIsSaving(true);
        try {
            const valueScores = activeStep === 2 ? calculateValueScores() : [];
            const dataToSave: UserValuesData = {
                top15Values,
                final7Values,
                pairwiseChoices,
                valueScores
            };

            await saveValuesData(dataToSave, startup?.id);
        } catch (error) {
            console.error('Error saving user values:', error);
            alert('Failed to save your progress. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        if (activeStep === 0 && top15Values.length !== 15) {
            alert('Please select exactly 15 values before proceeding.');
            return;
        }
        if (activeStep === 1 && final7Values.length !== 7) {
            alert('Please select exactly 7 values before proceeding.');
            return;
        }

        // Save progress after each step
        await saveProgress();
        if (activeStep === 2) {
            // Check if all pairwise comparisons are complete
            const expectedComparisons = (final7Values.length * (final7Values.length - 1)) / 2;
            const actualComparisons = Object.keys(pairwiseChoices).length / 2; // Divide by 2 because we store both directions

            if (actualComparisons < expectedComparisons) {
                alert(`Please complete all comparisons. You have completed ${actualComparisons} out of ${expectedComparisons} comparisons.`);
                return;
            }
        }

        // If we've completed the last step, save final data and mark values as completed
        if (activeStep === 2 && profile && user) {
            await saveProgress();
            const currentProgress = profile.progress || {
                profile: false,
                values: false,
                assessment: false,
                startup: false
            };
            await updateProfile({
                id: user.id,
                progress: {
                    ...currentProgress,
                    values: true
                }
            });
            // Navigate back to user page after completion
            navigate('/user');
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
                                <Psychology sx={{ fontSize: 64, color: categoryColors.entrepreneur, mb: 2 }} />
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
                                    },
                                    '& .Mui-active .MuiStepIcon-root': {
                                        color: categoryColors.entrepreneur,
                                    },
                                    '& .Mui-active .MuiStepIcon-text': {
                                        fill: 'white'
                                    },
                                    '& .Mui-completed .MuiStepIcon-root': {
                                        color: categoryColors.entrepreneur,
                                    },
                                    '& .Mui-completed .MuiStepIcon-text': {
                                        fill: 'white'
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

                            {loading ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography>Loading your saved progress...</Typography>
                                </Box>
                            ) : (
                                renderStepContent()
                            )}

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
                                    disabled={isSaving}
                                    sx={{
                                        backgroundColor: categoryColors.entrepreneur,
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: categoryColors.entrepreneur,
                                            filter: 'brightness(0.9)',
                                        }
                                    }}
                                >
                                    {isSaving ? 'Saving...' : (activeStep === steps.length - 1 ? 'Finish' : 'Next')}
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