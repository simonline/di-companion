import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import useSurvey from '@/hooks/useSurvey';
import useUserQuestions from '@/hooks/useUserQuestions';
import useUserQuestion from '@/hooks/useUserQuestion';
import useNotifications from '@/store/notifications';
import SurveyField from '@/components/SurveyField';
import { generateValidationSchema, FormValues } from '@/utils/generateValidationSchema';
import { generateInitialValues } from '@/utils/generateInitialValues';
import { Question } from '@/types/strapi';
import { CategoryEnum, categoryDisplayNames } from '@/utils/constants';

const SelfAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user, startup, updateScores } = useAuthContext();
  const { fetchSurveyByName, survey, loading: surveyLoading, error: surveyError } = useSurvey();
  const {
    fetchUserQuestions,
    userQuestions,
    clearUserQuestions,
    loading: userQuestionsLoading,
    error: userQuestionsError,
  } = useUserQuestions();
  const { createUserQuestion, updateUserQuestion } = useUserQuestion();
  const [, notificationsActions] = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(() => {
    // Restore activeStep from localStorage on mount
    const savedStep = localStorage.getItem('selfAssessmentActiveStep');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });

  // Save activeStep to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selfAssessmentActiveStep', activeStep.toString());
  }, [activeStep]);

  // Group questions by category
  const questionsByCategory = React.useMemo(() => {
    if (!survey?.questions) return {} as Record<CategoryEnum, Question[]>;
    return survey.questions.reduce((acc: Record<CategoryEnum, Question[]>, question: Question) => {
      const categories = (question as any).categories || [CategoryEnum.entrepreneur];
      categories.forEach((category: CategoryEnum) => {
        if (!acc[category]) acc[category] = [];
        acc[category].push(question);
      });
      return acc;
    }, {} as Record<CategoryEnum, Question[]>);
  }, [survey]);

  const categories = Object.keys(questionsByCategory) as CategoryEnum[];
  const currentCategory = categories[activeStep];
  const currentQuestions = questionsByCategory[currentCategory] || [];

  useEffect(() => {
    fetchSurveyByName("Self Assessment");
  }, [fetchSurveyByName]);

  useEffect(() => {
    if (startup?.documentId && user?.documentId) {
      fetchUserQuestions(startup.documentId, user.documentId);
    }
  }, [fetchUserQuestions, startup, user]);

  const handleSubmit = async (values: FormValues) => {
    if (!user || !startup || !survey) return;

    try {
      setIsSubmitting(true);

      // Process each question's answer
      for (const question of currentQuestions) {
        const answer = values[question.documentId];
        const existingResponse = userQuestions?.find(
          (uq) => uq.question.documentId === question.documentId,
        );

        // Skip if answer is empty and question is not required
        if ((!answer || (Array.isArray(answer) && answer.length === 0)) && !question.isRequired) continue;

        // Skip if answer hasn't changed
        if (existingResponse) {
          const existingAnswer = existingResponse.answer;
          if (JSON.stringify(existingAnswer) === JSON.stringify(answer)) continue;
        }

        const payload = {
          user: { set: { documentId: user.documentId } },
          question: { set: { documentId: question.documentId } },
          startup: { set: { documentId: startup.documentId } },
          answer: JSON.stringify(answer),
        };

        try {
          if (existingResponse) {
            await updateUserQuestion({
              documentId: existingResponse.documentId,
              ...payload,
            });
          } else {
            await createUserQuestion(payload);
          }
        } catch (error) {
          throw new Error(`Failed to save answer for question "${question.question}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Refetch to get the created/updated user questions
      clearUserQuestions();
      await fetchUserQuestions(startup.documentId, user.documentId);

      if (activeStep < categories.length - 1) {
        setActiveStep(prev => prev + 1);
        notificationsActions.push({
          options: { variant: 'success' },
          message: 'Answers saved successfully',
        });
      } else {
        // Only update scores when we've completed all steps
        await updateScores();
        notificationsActions.push({
          options: { variant: 'success' },
          message: 'Self assessment completed successfully',
        });
        // Clear the saved step from localStorage
        localStorage.removeItem('selfAssessmentActiveStep');
        navigate('/dashboard');
      }
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: error instanceof Error ? error.message : 'Failed to save answers. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (surveyLoading || userQuestionsLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (surveyError || userQuestionsError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 4,
        }}
      >
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error loading assessment
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!survey) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 4,
        }}
      >
        <Typography variant="h6">Assessment not found</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title="Self Assessment" />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {survey.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {survey.description}
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {categories.map((category) => (
                <Step key={category}>
                  <StepLabel>
                    <Typography
                      variant="body2"
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: activeStep === categories.indexOf(category) ? 'bold' : 'normal',
                      }}
                    >
                      {categoryDisplayNames[category]}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Formik
              initialValues={generateInitialValues(currentQuestions, userQuestions || undefined)}
              validationSchema={generateValidationSchema(currentQuestions)}
              onSubmit={handleSubmit}
            >
              {({ isValid }) => (
                <Form>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {currentQuestions
                      .sort((a: Question, b: Question) => (a.order || 0) - (b.order || 0))
                      .map((question: Question) => (
                        <Field key={question.documentId} name={question.documentId}>
                          {(fieldProps: any) => (
                            <SurveyField
                              question={question}
                              field={fieldProps.field}
                              form={fieldProps.form}
                            />
                          )}
                        </Field>
                      ))}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !isValid}
                      >
                        {activeStep === categories.length - 1 ? 'Complete Assessment' : 'Next'}
                      </Button>
                    </Box>
                  </Box>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default SelfAssessment;
