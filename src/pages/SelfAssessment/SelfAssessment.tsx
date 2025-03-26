import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CategoryEnum, categoryColors, categoryDisplayNames } from '@/utils/constants';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

// Define the assessment questions for each category
const assessmentQuestions = {
  [CategoryEnum.entrepreneur]: [
    {
      question: 'How clear is your vision for your startup?',
      options: [
        { label: 'Very unclear', value: 0 },
        { label: 'Somewhat unclear', value: 0.25 },
        { label: 'Neutral', value: 0.5 },
        { label: 'Somewhat clear', value: 0.75 },
        { label: 'Very clear', value: 1 },
      ],
    },
    {
      question: 'How would you rate your ability to adapt to changes?',
      options: [
        { label: 'Very poor', value: 0 },
        { label: 'Poor', value: 0.25 },
        { label: 'Average', value: 0.5 },
        { label: 'Good', value: 0.75 },
        { label: 'Excellent', value: 1 },
      ],
    },
  ],
  [CategoryEnum.team]: [
    {
      question: 'How effective is communication within your team?',
      options: [
        { label: 'Very ineffective', value: 0 },
        { label: 'Somewhat ineffective', value: 0.25 },
        { label: 'Neutral', value: 0.5 },
        { label: 'Somewhat effective', value: 0.75 },
        { label: 'Very effective', value: 1 },
      ],
    },
    {
      question: 'How well-defined are roles and responsibilities in your team?',
      options: [
        { label: 'Not defined at all', value: 0 },
        { label: 'Poorly defined', value: 0.25 },
        { label: 'Somewhat defined', value: 0.5 },
        { label: 'Well defined', value: 0.75 },
        { label: 'Very well defined', value: 1 },
      ],
    },
  ],
  [CategoryEnum.stakeholders]: [
    {
      question: 'How well do you understand your target customers?',
      options: [
        { label: 'Very poorly', value: 0 },
        { label: 'Poorly', value: 0.25 },
        { label: 'Moderately', value: 0.5 },
        { label: 'Well', value: 0.75 },
        { label: 'Very well', value: 1 },
      ],
    },
    {
      question: 'How effectively do you engage with your stakeholders?',
      options: [
        { label: 'Very ineffectively', value: 0 },
        { label: 'Ineffectively', value: 0.25 },
        { label: 'Moderately', value: 0.5 },
        { label: 'Effectively', value: 0.75 },
        { label: 'Very effectively', value: 1 },
      ],
    },
  ],
  [CategoryEnum.product]: [
    {
      question: 'How well does your product solve the identified problem?',
      options: [
        { label: 'Very poorly', value: 0 },
        { label: 'Poorly', value: 0.25 },
        { label: 'Moderately', value: 0.5 },
        { label: 'Well', value: 0.75 },
        { label: 'Very well', value: 1 },
      ],
    },
    {
      question: 'How unique is your product compared to competitors?',
      options: [
        { label: 'Not unique at all', value: 0 },
        { label: 'Slightly unique', value: 0.25 },
        { label: 'Moderately unique', value: 0.5 },
        { label: 'Very unique', value: 0.75 },
        { label: 'Extremely unique', value: 1 },
      ],
    },
  ],
  [CategoryEnum.sustainability]: [
    {
      question: 'How sustainable is your business model?',
      options: [
        { label: 'Not sustainable', value: 0 },
        { label: 'Slightly sustainable', value: 0.25 },
        { label: 'Moderately sustainable', value: 0.5 },
        { label: 'Very sustainable', value: 0.75 },
        { label: 'Extremely sustainable', value: 1 },
      ],
    },
    {
      question: 'How well do you consider environmental impact in your operations?',
      options: [
        { label: 'Not at all', value: 0 },
        { label: 'Minimally', value: 0.25 },
        { label: 'Moderately', value: 0.5 },
        { label: 'Significantly', value: 0.75 },
        { label: 'Extensively', value: 1 },
      ],
    },
  ],
  [CategoryEnum.time_space]: [
    {
      question: 'How effectively do you manage time and resources?',
      options: [
        { label: 'Very ineffectively', value: 0 },
        { label: 'Ineffectively', value: 0.25 },
        { label: 'Moderately', value: 0.5 },
        { label: 'Effectively', value: 0.75 },
        { label: 'Very effectively', value: 1 },
      ],
    },
    {
      question: 'How well do you plan for the future of your startup?',
      options: [
        { label: 'Very poorly', value: 0 },
        { label: 'Poorly', value: 0.25 },
        { label: 'Moderately', value: 0.5 },
        { label: 'Well', value: 0.75 },
        { label: 'Very well', value: 1 },
      ],
    },
  ],
};

const SelfAssessment: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { startup, updateStartup, updateScores } = useAuthContext();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = Object.keys(assessmentQuestions) as CategoryEnum[];
  const currentCategory = categories[activeStep];
  const questions = assessmentQuestions[currentCategory];

  const handleNext = () => {
    if (activeStep < categories.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAnswerChange = (questionIndex: number, value: number) => {
    const key = `${currentCategory}_${questionIndex}`;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const isStepComplete = () => {
    return questions.every((_, index) => {
      const key = `${currentCategory}_${index}`;
      return answers[key] !== undefined;
    });
  };

  const calculateScores = () => {
    const scores: Record<CategoryEnum, number> = {
      [CategoryEnum.entrepreneur]: 0,
      [CategoryEnum.team]: 0,
      [CategoryEnum.stakeholders]: 0,
      [CategoryEnum.product]: 0,
      [CategoryEnum.sustainability]: 0,
      [CategoryEnum.time_space]: 0,
    };

    // Calculate average score for each category
    Object.entries(answers).forEach(([key, value]) => {
      const [category] = key.split('_');
      scores[category as CategoryEnum] += value;
    });

    // Normalize scores (average)
    categories.forEach((category) => {
      const questionCount = assessmentQuestions[category].length;
      scores[category] = scores[category] / questionCount;
    });

    return scores;
  };

  const handleSubmit = async () => {
    if (!startup) return;

    setIsSubmitting(true);
    try {
      const scores = calculateScores();

      // Update startup with new scores
      await updateStartup({
        documentId: startup.documentId,
        scores,
      });

      // Refresh scores in the system
      await updateScores();

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating scores:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Self Assessment" />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Startup Maturity Self-Assessment
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Answer these questions to help us calculate your startup&apos;s maturity score
                across different perspectives. This will help us provide more tailored
                recommendations for your startup&apos;s growth.
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {categories.map((category) => (
                <Step key={category}>
                  <StepLabel>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          activeStep === categories.indexOf(category)
                            ? categoryColors[category]
                            : 'inherit',
                        fontWeight: activeStep === categories.indexOf(category) ? 'bold' : 'normal',
                      }}
                    >
                      {categoryDisplayNames[category]}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: categoryColors[currentCategory],
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {categoryDisplayNames[currentCategory]}
                <Tooltip title="Your answers in this section will help us understand your startup's maturity in this perspective.">
                  <InfoIcon fontSize="small" />
                </Tooltip>
              </Typography>

              {questions.map((q, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel component="legend" sx={{ mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {q.question}
                      </Typography>
                    </FormLabel>
                    <RadioGroup
                      value={answers[`${currentCategory}_${index}`] ?? ''}
                      onChange={(e) => handleAnswerChange(index, parseFloat(e.target.value))}
                    >
                      <Grid container spacing={1}>
                        {q.options.map((option) => (
                          <Grid item xs={12} sm={6} key={option.value}>
                            <FormControlLabel
                              value={option.value}
                              control={
                                <Radio
                                  sx={{
                                    color: categoryColors[currentCategory],
                                    '&.Mui-checked': {
                                      color: categoryColors[currentCategory],
                                    },
                                  }}
                                />
                              }
                              label={option.label}
                              sx={{
                                width: '100%',
                                border: '1px solid',
                                borderColor:
                                  answers[`${currentCategory}_${index}`] === option.value
                                    ? categoryColors[currentCategory]
                                    : 'divider',
                                borderRadius: 1,
                                p: 1,
                                m: 0,
                                '&:hover': {
                                  bgcolor: `${categoryColors[currentCategory]}10`,
                                },
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete() || isSubmitting}
                sx={{
                  bgcolor: categoryColors[currentCategory],
                  '&:hover': {
                    bgcolor:
                      theme.palette.mode === 'light'
                        ? `${categoryColors[currentCategory]}CC`
                        : `${categoryColors[currentCategory]}AA`,
                  },
                }}
              >
                {activeStep === categories.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default SelfAssessment;
