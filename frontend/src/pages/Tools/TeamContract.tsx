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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Grid,
    Chip,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
} from '@mui/material';
import {
    Description,
    Group,
    Person,
    Add as AddIcon,
    Delete as DeleteIcon,
    Business,
    Assignment,
    AttachMoney,
    Schedule,
    Psychology,
    Download,
    Share,
    ArrowBack,
} from '@mui/icons-material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
    name: string;
    role: string;
    equity: number;
    commitment: string;
    responsibilities: string[];
}

interface TeamContractFormValues {
    startupName: string;
    contractDate: string;
    teamMembers: TeamMember[];
    sharedValues: string[];
    communicationRules: string;
    decisionMaking: string;
    conflictResolution: string;
    equityVesting: string;
    exitStrategy: string;
    additionalTerms: string;
}

const COMMITMENT_LEVELS = [
    'Full-time (40+ hours/week)',
    'Part-time (20-30 hours/week)',
    'Advisor/Consultant (5-10 hours/week)',
    'Investor/Board Member',
];

const DECISION_MAKING_MODELS = [
    'Consensus (all must agree)',
    'Majority vote',
    'CEO/Founder decides',
    'Democratic with veto rights',
    'Role-based decisions',
];

const CONFLICT_RESOLUTION_METHODS = [
    'Direct communication',
    'Mediation with neutral party',
    'Vote among team members',
    'External arbitrator',
    'Escalation to board',
];

const validationSchema = Yup.object().shape({
    startupName: Yup.string().required('Startup name is required'),
    contractDate: Yup.date().required('Contract date is required'),
    teamMembers: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Name is required'),
            role: Yup.string().required('Role is required'),
            equity: Yup.number()
                .min(0, 'Equity must be 0 or greater')
                .max(100, 'Equity cannot exceed 100%')
                .required('Equity percentage is required'),
            commitment: Yup.string().required('Commitment level is required'),
            responsibilities: Yup.array().of(Yup.string()),
        })
    ).min(1, 'At least one team member is required'),
    sharedValues: Yup.array().min(1, 'At least one shared value is required'),
    communicationRules: Yup.string().required('Communication rules are required'),
    decisionMaking: Yup.string().required('Decision-making process is required'),
    conflictResolution: Yup.string().required('Conflict resolution method is required'),
    equityVesting: Yup.string().required('Equity vesting terms are required'),
    exitStrategy: Yup.string().required('Exit strategy is required'),
});

const TeamContract: React.FC = () => {
    const navigate = useNavigate();
    const { startup, user, profile } = useAuthContext();
    const isSolo = startup?.founders_count === 1;
    const [activeStep, setActiveStep] = useState(0);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const steps = isSolo ? [
        'Personal Commitment',
        'Goals & Values',
        'Work Style',
        'Review & Download'
    ] : [
        'Team Overview',
        'Roles & Equity',
        'Values & Culture',
        'Processes & Rules',
        'Review & Download'
    ];

    const initialValues: TeamContractFormValues = {
        startupName: startup?.name || '',
        contractDate: new Date().toISOString().split('T')[0],
        teamMembers: isSolo ? [
            {
                name: `${profile?.given_name || ''} ${profile?.family_name || ''}`.trim(),
                role: 'Founder & CEO',
                equity: 100,
                commitment: 'Full-time (40+ hours/week)',
                responsibilities: ['Strategic direction', 'Business development', 'Team leadership'],
            }
        ] : [],
        sharedValues: [],
        communicationRules: '',
        decisionMaking: '',
        conflictResolution: '',
        equityVesting: '4-year vesting with 1-year cliff',
        exitStrategy: '',
        additionalTerms: '',
    };

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleAddMember = () => {
        setEditingMemberIndex(null);
        setShowMemberDialog(true);
    };

    const handleEditMember = (index: number) => {
        setEditingMemberIndex(index);
        setShowMemberDialog(true);
    };

    const handleDeleteMember = (index: number, setFieldValue: any, values: TeamContractFormValues) => {
        const newMembers = values.teamMembers.filter((_, i) => i !== index);
        setFieldValue('teamMembers', newMembers);
    };

    const handleSubmit = async (values: TeamContractFormValues) => {
        try {
            // Here you would typically save to backend
            console.log('Team Contract Data:', values);

            setSnackbar({
                open: true,
                message: 'Team contract saved successfully!',
                severity: 'success',
            });

            // Generate and download PDF (simulated)
            setTimeout(() => {
                const contractText = generateContractText(values);
                downloadContract(contractText, values.startupName);
                // Navigate back to startup page after successful save
                navigate('/startup');
            }, 1500);

        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to save team contract',
                severity: 'error',
            });
        }
    };

    const generateContractText = (values: TeamContractFormValues): string => {
        return `
TEAM CONTRACT
${values.startupName}
Date: ${values.contractDate}

${isSolo ? 'SOLO FOUNDER AGREEMENT' : 'TEAM FOUNDER AGREEMENT'}

${isSolo ? 'PERSONAL COMMITMENT' : 'TEAM MEMBERS'}
${values.teamMembers.map(member => `
Name: ${member.name}
Role: ${member.role}
Equity: ${member.equity}%
Commitment: ${member.commitment}
Responsibilities: ${member.responsibilities.join(', ')}
`).join('\n')}

SHARED VALUES
${values.sharedValues.join(', ')}

COMMUNICATION RULES
${values.communicationRules}

DECISION-MAKING PROCESS
${values.decisionMaking}

CONFLICT RESOLUTION
${values.conflictResolution}

EQUITY VESTING
${values.equityVesting}

EXIT STRATEGY
${values.exitStrategy}

${values.additionalTerms ? `ADDITIONAL TERMS\n${values.additionalTerms}` : ''}

---
This contract represents our commitment to working together effectively and transparently.
        `.trim();
    };

    const downloadContract = (content: string, startupName: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${startupName.replace(/\s+/g, '_')}_Team_Contract.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderStepContent = (step: number, values: TeamContractFormValues, setFieldValue: any) => {
        switch (step) {
            case 0:
                return isSolo ? renderSoloCommitment(values, setFieldValue) : renderTeamOverview(values, setFieldValue);
            case 1:
                return isSolo ? renderGoalsValues(values, setFieldValue) : renderRolesEquity(values, setFieldValue);
            case 2:
                return isSolo ? renderWorkStyle(values, setFieldValue) : renderValuesCulture(values, setFieldValue);
            case 3:
                return isSolo ? renderReview(values) : renderProcessesRules(values, setFieldValue);
            case 4:
                return renderReview(values);
            default:
                return null;
        }
    };

    const renderSoloCommitment = (values: TeamContractFormValues, setFieldValue: any) => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Personal Commitment & Goals
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="startupName"
                        label="Startup Name"
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="contractDate"
                        label="Contract Date"
                        type="date"
                        required
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Personal Goals & Commitment
                    </Typography>
                    <Field
                        as={TextField}
                        fullWidth
                        name="additionalTerms"
                        label="Describe your personal goals, commitment level, and what success looks like for you"
                        multiline
                        rows={4}
                        placeholder="I commit to working full-time on this startup for the next 2 years. My primary goals are to validate the problem, build an MVP, and secure initial funding..."
                    />
                </Grid>
            </Grid>
        </Box>
    );

    const renderGoalsValues = (values: TeamContractFormValues, setFieldValue: any) => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Goals & Values
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Personal Values & Principles
                    </Typography>
                    <FormGroup>
                        {['Integrity', 'Innovation', 'Customer Focus', 'Continuous Learning', 'Resilience', 'Transparency'].map((value) => (
                            <FormControlLabel
                                key={value}
                                control={
                                    <Checkbox
                                        checked={values.sharedValues.includes(value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFieldValue('sharedValues', [...values.sharedValues, value]);
                                            } else {
                                                setFieldValue('sharedValues', values.sharedValues.filter(v => v !== value));
                                            }
                                        }}
                                    />
                                }
                                label={value}
                            />
                        ))}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="communicationRules"
                        label="How will you communicate with stakeholders and maintain transparency?"
                        multiline
                        rows={3}
                        placeholder="I will provide monthly updates to stakeholders, maintain open communication channels, and be transparent about challenges and progress..."
                    />
                </Grid>
            </Grid>
        </Box>
    );

    const renderWorkStyle = (values: TeamContractFormValues, setFieldValue: any) => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Work Style & Processes
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Decision-Making Approach</InputLabel>
                        <Field as={Select} name="decisionMaking" label="Decision-Making Approach">
                            {DECISION_MAKING_MODELS.map((model) => (
                                <MenuItem key={model} value={model}>{model}</MenuItem>
                            ))}
                        </Field>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="equityVesting"
                        label="Personal Development & Learning Plan"
                        multiline
                        rows={3}
                        placeholder="I will dedicate 5 hours per week to learning new skills, attend relevant workshops, and seek mentorship..."
                    />
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="exitStrategy"
                        label="Success Metrics & Exit Strategy"
                        multiline
                        rows={3}
                        placeholder="I will measure success by achieving product-market fit within 18 months, securing $500K in funding, and building a team of 5 people..."
                    />
                </Grid>
            </Grid>
        </Box>
    );

    const renderTeamOverview = (values: TeamContractFormValues, setFieldValue: any) => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Team Overview
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="startupName"
                        label="Startup Name"
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="contractDate"
                        label="Contract Date"
                        type="date"
                        required
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1">Team Members</Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddMember}
                        >
                            Add Member
                        </Button>
                    </Box>
                    <List>
                        {values.teamMembers.map((member, index) => (
                            <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                                <ListItemIcon>
                                    <Person />
                                </ListItemIcon>
                                <ListItemText
                                    primary={member.name}
                                    secondary={`${member.role} • ${member.equity}% equity • ${member.commitment}`}
                                />
                                <IconButton onClick={() => handleEditMember(index)}>
                                    <AddIcon />
                                </IconButton>
                                {values.teamMembers.length > 1 && (
                                    <IconButton onClick={() => handleDeleteMember(index, setFieldValue, values)}>
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>
        </Box>
    );

    const renderRolesEquity = (values: TeamContractFormValues, setFieldValue: any) => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Roles, Responsibilities & Equity
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Team Member Details
                    </Typography>
                    {values.teamMembers.map((member, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>{member.name}</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Role"
                                        value={member.role}
                                        onChange={(e) => {
                                            const newMembers = [...values.teamMembers];
                                            newMembers[index].role = e.target.value;
                                            setFieldValue('teamMembers', newMembers);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Equity %"
                                        type="number"
                                        value={member.equity}
                                        onChange={(e) => {
                                            const newMembers = [...values.teamMembers];
                                            newMembers[index].equity = Number(e.target.value);
                                            setFieldValue('teamMembers', newMembers);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Commitment Level</InputLabel>
                                        <Select
                                            value={member.commitment}
                                            onChange={(e) => {
                                                const newMembers = [...values.teamMembers];
                                                newMembers[index].commitment = e.target.value;
                                                setFieldValue('teamMembers', newMembers);
                                            }}
                                            label="Commitment Level"
                                        >
                                            {COMMITMENT_LEVELS.map((level) => (
                                                <MenuItem key={level} value={level}>{level}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Key Responsibilities"
                                        multiline
                                        rows={2}
                                        value={member.responsibilities.join(', ')}
                                        onChange={(e) => {
                                            const newMembers = [...values.teamMembers];
                                            newMembers[index].responsibilities = e.target.value.split(',').map(s => s.trim());
                                            setFieldValue('teamMembers', newMembers);
                                        }}
                                        placeholder="Strategic planning, Product development, Marketing..."
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Grid>
            </Grid>
        </Box>
    );

    const renderValuesCulture = (values: TeamContractFormValues, setFieldValue: any) => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Shared Values & Culture
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Select Shared Values
                    </Typography>
                    <FormGroup>
                        {['Trust', 'Transparency', 'Innovation', 'Customer Focus', 'Continuous Learning', 'Resilience', 'Collaboration', 'Integrity', 'Excellence', 'Adaptability'].map((value) => (
                            <FormControlLabel
                                key={value}
                                control={
                                    <Checkbox
                                        checked={values.sharedValues.includes(value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFieldValue('sharedValues', [...values.sharedValues, value]);
                                            } else {
                                                setFieldValue('sharedValues', values.sharedValues.filter(v => v !== value));
                                            }
                                        }}
                                    />
                                }
                                label={value}
                            />
                        ))}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="communicationRules"
                        label="Communication Rules & Expectations"
                        multiline
                        rows={3}
                        placeholder="We will have weekly team meetings, use Slack for daily communication, and provide monthly progress updates to all stakeholders..."
                    />
                </Grid>
            </Grid>
        </Box>
    );

    const renderProcessesRules = (values: TeamContractFormValues, setFieldValue: any) => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Processes & Rules
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Decision-Making Process</InputLabel>
                        <Field as={Select} name="decisionMaking" label="Decision-Making Process">
                            {DECISION_MAKING_MODELS.map((model) => (
                                <MenuItem key={model} value={model}>{model}</MenuItem>
                            ))}
                        </Field>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Conflict Resolution Method</InputLabel>
                        <Field as={Select} name="conflictResolution" label="Conflict Resolution Method">
                            {CONFLICT_RESOLUTION_METHODS.map((method) => (
                                <MenuItem key={method} value={method}>{method}</MenuItem>
                            ))}
                        </Field>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="equityVesting"
                        label="Equity Vesting Terms"
                        multiline
                        rows={2}
                        placeholder="4-year vesting with 1-year cliff, monthly vesting after cliff..."
                    />
                </Grid>
                <Grid item xs={12}>
                    <Field
                        as={TextField}
                        fullWidth
                        name="exitStrategy"
                        label="Exit Strategy & Success Metrics"
                        multiline
                        rows={3}
                        placeholder="We aim to achieve product-market fit within 18 months, secure Series A funding within 2 years, and consider acquisition or IPO as exit options..."
                    />
                </Grid>
            </Grid>
        </Box>
    );

    const renderReview = (values: TeamContractFormValues) => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Review Your {isSolo ? 'Personal' : 'Team'} Contract
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Basic Information
                        </Typography>
                        <Typography><strong>Startup:</strong> {values.startupName}</Typography>
                        <Typography><strong>Date:</strong> {values.contractDate}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {isSolo ? 'Personal Commitment' : 'Team Members'}
                        </Typography>
                        {values.teamMembers.map((member, index) => (
                            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="subtitle1"><strong>{member.name}</strong></Typography>
                                <Typography>Role: {member.role}</Typography>
                                <Typography>Equity: {member.equity}%</Typography>
                                <Typography>Commitment: {member.commitment}</Typography>
                                <Typography>Responsibilities: {member.responsibilities.join(', ')}</Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Values & Culture
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {values.sharedValues.map((value) => (
                                <Chip key={value} label={value} color="primary" variant="outlined" />
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Processes & Rules
                        </Typography>
                        <Typography><strong>Communication:</strong> {values.communicationRules}</Typography>
                        <Typography><strong>Decision-Making:</strong> {values.decisionMaking}</Typography>
                        <Typography><strong>Conflict Resolution:</strong> {values.conflictResolution}</Typography>
                        <Typography><strong>Equity Vesting:</strong> {values.equityVesting}</Typography>
                        <Typography><strong>Exit Strategy:</strong> {values.exitStrategy}</Typography>
                    </Paper>
                </Grid>

                {values.additionalTerms && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Additional Terms
                            </Typography>
                            <Typography>{values.additionalTerms}</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );

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

                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ values, setFieldValue, isValid, errors, touched }) => (
                                    <Form>
                                        {renderStepContent(activeStep, values, setFieldValue)}

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                            <Button
                                                variant="outlined"
                                                onClick={handleBack}
                                                disabled={activeStep === 0}
                                            >
                                                Back
                                            </Button>
                                            <Box>
                                                {activeStep < steps.length - 1 ? (
                                                    <Button
                                                        variant="contained"
                                                        onClick={handleNext}
                                                        disabled={!isValid}
                                                    >
                                                        Next
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        startIcon={<Download />}
                                                        disabled={!isValid}
                                                    >
                                                        Download Contract
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    </Form>
                                )}
                            </Formik>
                        </CardContent>
                    </Card>
                </Container>
            </CenteredFlexBox>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default TeamContract; 