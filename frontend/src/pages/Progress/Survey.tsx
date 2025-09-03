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
import useUserQuestions from '@/hooks/useUserQuestions';
import useStartupQuestions from '@/hooks/useStartupQuestions';
import {
  Question,
  UserQuestion,
  StartupQuestion
} from '@/types/database';
import useUserQuestion from '@/hooks/useUserQuestion';
import useStartupQuestion from '@/hooks/useStartupQuestion';
import useStartupPattern from '@/hooks/useStartupPattern';
import useStartupPatterns from '@/hooks/useStartupPatterns';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import Header from '@/sections/Header';
import { useAuthContext } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';
import SurveyField from '@/components/SurveyField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { generateValidationSchema, FormValues } from '@/utils/generateValidationSchema';
import { generateInitialValues } from '@/utils/generateInitialValues';
import { supabaseGetPatternQuestions, supabaseGetSurveyQuestions } from '@/lib/supabase';

const Survey: React.FC = () => {
  const { patternId } = useParams<{ patternId: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [, notificationsActions] = useNotifications();
  const { user, startup, updateScores } = useAuthContext();
  const { fetchPattern, pattern, loading: patternLoading, error: patternError } = usePattern();
  const { fetchSurveyByName, survey, loading: surveyLoading, error: surveyError } = useSurvey();
  const { updateStartupPattern, createStartupPattern } = useStartupPattern();
  const { fetchStartupPatterns, startupPatterns } = useStartupPatterns();
  const {
    fetchUserQuestions,
    userQuestions,
    clearUserQuestions,
    loading: userQuestionsLoading,
    error: userQuestionsError,
  } = useUserQuestions();
  const { createUserQuestion, updateUserQuestion } = useUserQuestion();
  const {
    fetchStartupQuestions,
    startupQuestions,
    clearStartupQuestions,
    loading: startupQuestionsLoading,
    error: startupQuestionsError,
  } = useStartupQuestions();
  const { createStartupQuestion, updateStartupQuestion } = useStartupQuestion();
  const userId = user?.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [patternQuestions, setPatternQuestions] = useState<Question[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<Question[]>([]);
  const hasPatternQuestions = patternQuestions.length > 0;
  const hasSurveyQuestions = surveyQuestions.length > 0;
  const isEntrepreneurCategory = pattern?.category === 'entrepreneur';

  useEffect(() => {
    setActiveStep(hasPatternQuestions ? 0 : 1);
  }, [hasPatternQuestions]);

  useEffect(() => {
    fetchPattern(patternId as string);
  }, [fetchPattern, patternId]);

  useEffect(() => {
    // Fetch pattern questions separately
    if (pattern?.id) {
      supabaseGetPatternQuestions(pattern.id).then(setPatternQuestions);
    }
  }, [pattern]);

  useEffect(() => {
    if (pattern && pattern.survey) {
      // Fetch survey and questions
      fetchSurveyByName("Default Survey");
    }
  }, [fetchSurveyByName, pattern]);

  useEffect(() => {
    // Fetch survey questions separately
    if (survey?.id) {
      supabaseGetSurveyQuestions(survey.id).then(setSurveyQuestions);
    }
  }, [survey]);

  useEffect(() => {
    if (patternId && pattern) {
      if (isEntrepreneurCategory) {
        // For entrepreneur category, fetch user questions
        if (startup && userId) {
          fetchUserQuestions(startup?.id, userId, patternId);
        }
      } else {
        // For other categories, fetch startup questions
        if (startup) {
          fetchStartupQuestions(startup?.id, patternId);
        }
      }
    }
  }, [fetchUserQuestions, fetchStartupQuestions, startup, userId, patternId, pattern, isEntrepreneurCategory]);

  useEffect(() => {
    if (startup && patternId) {
      fetchStartupPatterns(startup.id, patternId);
    }
  }, [fetchStartupPatterns, startup, patternId]);

  useEffect(() => {
    const questions = isEntrepreneurCategory ? userQuestions : startupQuestions;
    if (isApplied && pattern && survey && questions && startupPatterns && startup?.id && patternId) {
      const points = calculatePoints(
        [
          ...patternQuestions,
          ...surveyQuestions,
        ],
        questions
      );

      console.log('points', points);

      // If no startup pattern exists, create one
      if (!startupPatterns || startupPatterns.length === 0) {
        createStartupPattern({
          startup_id: startup.id,
          user_id: user?.id as string,
          pattern_id: patternId,
          response_type: 'accept',
          response: 'share_reflection',
          applied_at: new Date().toISOString(),
          points,
        });
      } else {
        // Update the existing startup pattern with the points
        updateStartupPattern({
          id: startupPatterns[0].id,
          applied_at: new Date().toISOString(),
          points,
        });
      }

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
    patternQuestions,
    surveyQuestions,
    user?.id,
    survey,
    userQuestions,
    updateScores,
    updateStartupPattern,
    createStartupPattern,
    navigate,
    state,
    notificationsActions,
    pattern,
    patternId,
    startup,
    isEntrepreneurCategory,
    startupQuestions,
  ]);

  const handleAssessmentSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      if (!pattern || !patternId || !startup) return;

      // Process each question's answer
      const questionPromises = patternQuestions.map(async (question) => {
        const answer = values[question.id];

        if (isEntrepreneurCategory) {
          // Handle UserQuestions for entrepreneur category
          if (!user) return null;

          const existingResponse = userQuestions?.find(
            (uq) => uq.question_id === question.id,
          );

          // Skip if answer is empty and question is not required
          if ((!answer || (Array.isArray(answer) && answer.length === 0)) && !question.is_required) return null;

          // Skip if answer hasn't changed
          if (existingResponse) {
            const existingAnswer = JSON.parse(existingResponse.answer as any);
            if (JSON.stringify(existingAnswer) === JSON.stringify(answer)) return null;
          }

          const payload = {
            user_id: user.id,
            pattern_id: patternId,
            question_id: question.id,
            startup_id: startup.id,
            answer: JSON.stringify(answer),
          };

          if (existingResponse) {
            return updateUserQuestion({
              id: existingResponse.id,
              ...payload,
            });
          } else {
            return createUserQuestion(payload);
          }
        } else {
          // Handle StartupQuestions for other categories
          const existingResponse = startupQuestions?.find(
            (sq) => sq.question_id === question.id,
          );

          // Skip if answer is empty and question is not required
          if ((!answer || (Array.isArray(answer) && answer.length === 0)) && !question.is_required) return null;

          // Skip if answer hasn't changed
          if (existingResponse) {
            const existingAnswer = JSON.parse(existingResponse.answer as any);
            if (JSON.stringify(existingAnswer) === JSON.stringify(answer)) return null;
          }

          const payload = {
            startup_id: startup.id,
            pattern_id: patternId,
            question_id: question.id,
            answer: JSON.stringify(answer),
          };

          if (existingResponse) {
            return updateStartupQuestion({
              id: existingResponse.id,
              ...payload,
            });
          } else {
            return createStartupQuestion(payload);
          }
        }
      });

      // Filter out null promises and wait for the rest
      await Promise.all(questionPromises.filter(p => p !== null));

      // Refetch to get the created/updated questions
      if (isEntrepreneurCategory) {
        clearUserQuestions();
        await fetchUserQuestions(startup.id, user?.id, patternId);
      } else {
        clearStartupQuestions();
        await fetchStartupQuestions(startup.id, patternId);
      }
      setActiveStep(1);
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to submit assessment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEffortSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      if (!startup || !patternId || !survey) return;

      // Process each question's answer
      const questionPromises = surveyQuestions.map(async (question) => {
        const answer = values[question.id];

        if (isEntrepreneurCategory) {
          // Handle UserQuestions for entrepreneur category
          if (!user) return null;

          const existingResponse = userQuestions?.find(
            (uq) => uq.question_id === question.id,
          );

          // Skip if answer is empty and question is not required
          if ((!answer || (Array.isArray(answer) && answer.length === 0)) && !question.is_required) return null;

          // Skip if answer hasn't changed
          if (existingResponse) {
            const existingAnswer = JSON.parse(existingResponse.answer as any);
            if (JSON.stringify(existingAnswer) === JSON.stringify(answer)) return null;
          }

          const payload = {
            user_id: user.id,
            pattern_id: patternId,
            question_id: question.id,
            startup_id: startup.id,
            answer: JSON.stringify(answer),
          };

          if (existingResponse) {
            return updateUserQuestion({
              id: existingResponse.id,
              ...payload,
            });
          } else {
            return createUserQuestion(payload);
          }
        } else {
          // Handle StartupQuestions for other categories
          const existingResponse = startupQuestions?.find(
            (sq) => sq.question_id === question.id,
          );

          // Skip if answer is empty and question is not required
          if ((!answer || (Array.isArray(answer) && answer.length === 0)) && !question.is_required) return null;

          // Skip if answer hasn't changed
          if (existingResponse) {
            const existingAnswer = JSON.parse(existingResponse.answer as any);
            if (JSON.stringify(existingAnswer) === JSON.stringify(answer)) return null;
          }

          const payload = {
            startup_id: startup.id,
            pattern_id: patternId,
            question_id: question.id,
            answer: JSON.stringify(answer),
          };

          if (existingResponse) {
            return updateStartupQuestion({
              id: existingResponse.id,
              ...payload,
            });
          } else {
            return createStartupQuestion(payload);
          }
        }
      });

      // Filter out null promises and wait for the rest
      await Promise.all(questionPromises.filter(p => p !== null));

      // Refetch to get the created/updated questions (for points calculation)
      if (isEntrepreneurCategory) {
        clearUserQuestions();
        fetchUserQuestions(startup.id, user?.id, patternId);
      } else {
        clearStartupQuestions();
        fetchStartupQuestions(startup.id, patternId);
      }
      setIsApplied(true);
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to submit effort',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatePoints = (questions: Question[], answers: (UserQuestion | StartupQuestion)[] | null): number => {
    if (!answers) return 0;
    return questions.reduce((acc, question) => {
      // Skip questions without weight
      if (!question.weight) return acc;

      // Find the response to the question
      const userQuestion = answers.find(
        (uq) => uq.question_id === question.id,
      );

      if (!userQuestion) return acc;
      const answer = JSON.parse(userQuestion.answer as any);
      // Find the option that corresponds to the answer
      const option = Array.isArray(question.options)
        ? question.options.find((o: { value: any }) => o.value === answer)
        : undefined;
      if (!option?.points) return acc;
      // Calculate points for the question
      const points = option.points * question.weight;
      return acc + points;
    }, 0);
  };

  const isLoading = patternLoading || surveyLoading ||
    (isEntrepreneurCategory ? userQuestionsLoading : startupQuestionsLoading);

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const hasError = patternError || surveyError ||
    (isEntrepreneurCategory ? userQuestionsError : startupQuestionsError);

  if (hasError) {
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
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/progress/${pattern.id}`)}
                startIcon={<ArrowBackIcon />}
                size="small"
                sx={{ mb: 4 }}
              >
                Back to Pattern
              </Button>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {pattern.name}
                </Typography>
              </Box>

              {hasPatternQuestions && hasSurveyQuestions && (
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                  <Step>
                    <StepLabel>Assessment</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Effort</StepLabel>
                  </Step>
                </Stepper>
              )}

              {activeStep === 0 && hasPatternQuestions && (
                <Formik
                  initialValues={generateInitialValues(
                    patternQuestions,
                    (isEntrepreneurCategory ? userQuestions : startupQuestions) || undefined,
                  )}
                  validationSchema={generateValidationSchema(patternQuestions)}
                  onSubmit={handleAssessmentSubmit}
                  validateOnChange={true}
                  validateOnBlur={true}
                >
                  {({ isValid, errors }) => (
                    <Form>
                      {Object.keys(errors).length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <Typography variant="body2" color="error">
                            Some fields are not valid:
                            {patternQuestions
                              .filter((question) => errors[question.id])
                              .map((question) => (
                                <Typography key={question.id}>
                                  {question.question}: {errors[question.id]}
                                </Typography>
                              ))}
                          </Typography>
                          {/* Debug section - can be removed later */}
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Debug Info:
                              <br />
                              Total Errors: {Object.keys(errors).length}
                              <br />
                              Form Valid: {isValid ? 'Yes' : 'No'}
                              <br />
                              Required Fields:{' '}
                              {patternQuestions.filter((q) => q.is_required).length}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {patternQuestions
                          .sort((a: Question, b: Question) => (a.order ?? 0) - (b.order ?? 0))
                          .map((question: Question) => (
                            <Field key={question.id} name={question.id}>
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
                            ) : (isEntrepreneurCategory ? userQuestions : startupQuestions)?.length ? (
                              'Update Assessment'
                            ) : (
                              'Submit Assessment'
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
                  initialValues={generateInitialValues(
                    surveyQuestions,
                    (isEntrepreneurCategory ? userQuestions : startupQuestions) || undefined,
                  )}
                  validationSchema={generateValidationSchema(surveyQuestions)}
                  onSubmit={handleEffortSubmit}
                >
                  {({ isValid }) => (
                    <Form>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {surveyQuestions
                          .sort((a: Question, b: Question) => (a.order ?? 0) - (b.order ?? 0))
                          .map((question: Question) => (
                            <Field key={question.id} name={question.id}>
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
                              Back to Assessment
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
                            ) : (isEntrepreneurCategory ? userQuestions : startupQuestions)?.length ? (
                              'Update Effort'
                            ) : (
                              'Submit Effort'
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
