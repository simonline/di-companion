import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { CenteredFlexBox } from '@/components/styled';
import usePattern from '@/hooks/usePattern';
import useSurvey from '@/hooks/useSurvey';
import useStartupQuestions from '@/hooks/useStartupQuestions';
import { Question, QuestionType, StartupQuestion } from '@/types/strapi';
import useStartupQuestion from '@/hooks/useStartupQuestion';
import useStartupPattern from '@/hooks/useStartupPattern';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';
import SurveyField from '@/components/SurveyField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface FormValues {
  [key: string]: string | string[] | number | boolean;
}

const Survey: React.FC = () => {
  const { patternId } = useParams<{ patternId: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [, notificationsActions] = useNotifications();
  const { startup, updateScores } = useAuthContext();
  const { fetchPattern, pattern, loading: patternLoading, error: patternError } = usePattern();
  const { fetchSurvey, survey, loading: surveyLoading, error: surveyError } = useSurvey();
  const { updateStartupPattern } = useStartupPattern();
  const { fetchStartupPatterns, startupPatterns } = useStartupPatterns();
  const {
    fetchStartupQuestions,
    startupQuestions,
    clearStartupQuestions,
    loading: startupQuestionsLoading,
    error: startupQuestionsError,
  } = useStartupQuestions();
  const { createStartupQuestion, updateStartupQuestion } = useStartupQuestion();
  const startupDocumentId = startup?.documentId;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const hasPatternQuestions = pattern?.questions && pattern.questions.length > 0;
  const hasSurveyQuestions = survey?.questions && survey.questions.length > 0;

  useEffect(() => {
    setActiveStep(hasPatternQuestions ? 0 : 1);
  }, [hasPatternQuestions]);

  useEffect(() => {
    fetchPattern(patternId as string);
  }, [fetchPattern, patternId]);

  useEffect(() => {
    if (pattern && pattern.survey) {
      // Fetch survey and questions
      fetchSurvey(pattern.survey.documentId);
    }
  }, [fetchSurvey, pattern]);

  useEffect(() => {
    if (startupDocumentId && patternId && survey) {
      fetchStartupQuestions(startupDocumentId, patternId, survey.documentId);
    }
  }, [fetchStartupQuestions, startupDocumentId, patternId, survey]);

  useEffect(() => {
    if (startupDocumentId && patternId) {
      fetchStartupPatterns(startupDocumentId, patternId);
    }
  }, [fetchStartupPatterns, startupDocumentId, patternId]);

  useEffect(() => {
    if (isApplied && startupPatterns && startupPatterns.length && survey && startupQuestions) {
      const points = calculatePoints(survey.questions, startupQuestions);

      // Update the startup pattern with the points
      updateStartupPattern({
        documentId: startupPatterns[0].documentId,
        appliedAt: new Date().toISOString(),
        points,
      });
      // Recalculate the total points
      updateScores();

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Pattern applied successfully',
      });
      navigate(state?.nextUrl || '/progress');
    }
  }, [
    isApplied,
    startupPatterns,
    survey,
    startupQuestions,
    updateScores,
    updateStartupPattern,
    navigate,
    state,
    notificationsActions,
  ]);

  const generateValidationSchema = (questions: Question[]) => {
    const schema: { [key: string]: any } = {};

    questions.forEach((question) => {
      const fieldName = question.documentId;
      let validator;

      switch (question.type) {
        case QuestionType.email:
          validator = Yup.string().email('Invalid email address');
          break;
        case QuestionType.number:
          validator = Yup.number().typeError('Must be a number');
          break;
        case QuestionType.select_multiple:
          validator = Yup.array().of(Yup.string());
          break;
        case QuestionType.checkbox:
          validator = Yup.boolean();
          break;
        default:
          validator = Yup.string();
      }

      if (question.isRequired) {
        validator = validator.required('This field is required');
      }

      schema[fieldName] = validator;
    });

    return Yup.object().shape(schema);
  };

  const generateInitialValues = (questions: Question[]): FormValues => {
    const values: FormValues = {};

    questions.forEach((question) => {
      const existingAnswer = startupQuestions?.find(
        (sq) => sq.question.documentId === question.documentId,
      );

      if (existingAnswer?.answer !== undefined) {
        values[question.documentId] = JSON.parse(existingAnswer.answer);
      } else {
        switch (question.type) {
          case QuestionType.select_multiple:
            values[question.documentId] = [];
            break;
          case QuestionType.checkbox:
            values[question.documentId] = false;
            break;
          case QuestionType.number:
            values[question.documentId] = '';
            break;
          default:
            values[question.documentId] = '';
        }
      }
    });

    return values;
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      if (!survey || !startup || !patternId) return;

      // Process each question's answer
      const questionPromises = survey.questions.map(async (question) => {
        const answer = values[question.documentId];
        const existingResponse = startupQuestions?.find(
          (sq) => sq.question.documentId === question.documentId,
        );

        const payload = {
          startup: { set: { documentId: startup.documentId } },
          pattern: { set: { documentId: patternId } },
          question: { set: { documentId: question.documentId } },
          answer: JSON.stringify(answer),
        };

        if (existingResponse) {
          return updateStartupQuestion({
            documentId: existingResponse.documentId,
            ...payload,
          });
        } else {
          return createStartupQuestion(payload);
        }
      });

      await Promise.all(questionPromises);

      // Refetch to get the created/updated startup questions (for points calculation)
      clearStartupQuestions();
      fetchStartupQuestions(startup.documentId, patternId, survey.documentId);
      setIsApplied(true);
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to submit response',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePoints = (questions: Question[], startupQuestions: StartupQuestion[]): number => {
    return questions.reduce((acc, question) => {
      // Skip questions without weight
      if (!question.weight) return acc;

      // Find the startup's response to the question
      const startupQuestion = startupQuestions.find(
        (sq) => sq.question.documentId === question.documentId,
      );

      if (!startupQuestion) return acc;
      const answer = JSON.parse(startupQuestion.answer);
      // Find the option that corresponds to the answer
      const option = question.options?.find((o) => o.value === answer);
      if (!option?.points) return acc;
      // Calculate points for the question
      const points = option.points * question.weight;
      return acc + points;
    }, 0);
  };

  if (patternLoading || surveyLoading || startupQuestionsLoading) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (patternError || surveyError || startupQuestionsError) {
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
          Error loading survey
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!pattern || !survey) {
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
        <Typography variant="h6">Survey not found</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title={pattern.name} />
      <CenteredFlexBox>
        <Grid container spacing={3} sx={{ maxWidth: '1200px', width: '100%' }}>
          {/* Form */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <Typography variant="h5">{pattern.name}</Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/progress/${pattern.documentId}`)}
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Pattern
                </Button>
              </Box>

              {hasPatternQuestions && hasSurveyQuestions && (
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                  <Step>
                    <StepLabel>Quiz</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Check</StepLabel>
                  </Step>
                </Stepper>
              )}

              {activeStep === 0 && hasPatternQuestions && (
                <Formik
                  initialValues={generateInitialValues(pattern.questions)}
                  validationSchema={generateValidationSchema(pattern.questions)}
                  onSubmit={handleSubmit}
                >
                  {({ isValid }) => (
                    <Form>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {pattern.questions
                          .sort((a: Question, b: Question) => a.order - b.order)
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

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting || !isValid}
                          >
                            {isSubmitting ? (
                              <CircularProgress size={24} />
                            ) : startupQuestions?.length ? (
                              'Update Response'
                            ) : (
                              'Submit Response'
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </Form>
                  )}
                </Formik>
              )}

              {activeStep === 1 && hasSurveyQuestions && (
                <Formik
                  initialValues={generateInitialValues(survey.questions)}
                  validationSchema={generateValidationSchema(survey.questions)}
                  onSubmit={handleSubmit}
                >
                  {({ isValid }) => (
                    <Form>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {survey.questions
                          .sort((a: Question, b: Question) => a.order - b.order)
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

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                          {hasPatternQuestions && (
                            <Button variant="outlined" onClick={() => setActiveStep(0)}>
                              Back
                            </Button>
                          )}
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting || !isValid}
                          >
                            {isSubmitting ? (
                              <CircularProgress size={24} />
                            ) : startupQuestions?.length ? (
                              'Update Response'
                            ) : (
                              'Submit Response'
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </Form>
                  )}
                </Formik>
              )}
            </Paper>
          </Grid>
        </Grid>
      </CenteredFlexBox>
    </>
  );
};

export default Survey;
