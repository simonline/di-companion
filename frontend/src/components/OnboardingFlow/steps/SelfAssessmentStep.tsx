import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuthContext } from '@/hooks/useAuth';
import { Formik, Form, Field } from 'formik';
import useSurvey from '@/hooks/useSurvey';
import useUserQuestions from '@/hooks/useUserQuestions';
import useUserQuestion from '@/hooks/useUserQuestion';
import SurveyField from '@/components/SurveyField';
import { generateValidationSchema, FormValues } from '@/utils/generateValidationSchema';
import { generateInitialValues } from '@/utils/generateInitialValues';
import { Tables } from '@/types/database';
import { OnboardingStepProps } from '../OnboardingFlow';
import { supabaseGetSurveyQuestions } from '@/lib/supabase';

const SelfAssessmentStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [questions, setQuestions] = useState<Tables<'questions'>[]>([]);

  useEffect(() => {
    fetchSurveyByName("Self Assessment");
  }, [fetchSurveyByName]);

  useEffect(() => {
    // Fetch questions separately when survey is loaded
    if (survey?.id) {
      supabaseGetSurveyQuestions(survey.id).then(setQuestions);
    }
  }, [survey]);

  useEffect(() => {
    if (startup?.id && user?.id) {
      fetchUserQuestions(startup.id, user.id);
    }
  }, [fetchUserQuestions, startup, user]);

  const handleSubmit = async (values: FormValues) => {
    if (!user || !startup || !survey) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // Process each question's answer
      for (const question of questions) {
        const answer = values[question.id];
        const existingResponse = userQuestions?.find(
          (uq) => uq.question && uq.question.id === question.id,
        );

        // Skip if answer is empty and question is not required
        if ((!answer || (Array.isArray(answer) && answer.length === 0)) && !question.is_required) continue;

        // Skip if answer hasn't changed
        if (existingResponse) {
          const existingAnswer = existingResponse.answer;
          if (JSON.stringify(existingAnswer) === JSON.stringify(answer)) continue;
        }

        const payload = {
          user: { set: { id: user.id } },
          question: { set: { id: question.id } },
          startup: { set: { id: startup.id } },
          answer: JSON.stringify(answer),
        };

        try {
          if (existingResponse) {
            await updateUserQuestion({
              id: existingResponse.id,
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
      await fetchUserQuestions(startup.id, user.id);

      // Update scores for the startup
      await updateScores();

      // Move to next step
      onNext();
    } catch (error) {
      console.error('Self assessment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip the assessment for now
    onNext();
  };

  if (surveyLoading || userQuestionsLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (surveyError || userQuestionsError) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading assessment: {surveyError || userQuestionsError}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={onBack} disabled={isFirstStep}>
            Back
          </Button>
          <Button variant="contained" onClick={handleSkip}>
            Skip Assessment
          </Button>
        </Box>
      </Box>
    );
  }

  if (!survey || !questions.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Assessment not available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The self-assessment is currently not available. You can skip this step and complete it later.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={onBack} disabled={isFirstStep}>
            Back
          </Button>
          <Button variant="contained" onClick={handleSkip}>
            Skip Assessment
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This assessment will help us understand your entrepreneurial background and provide
        personalized recommendations. It takes about 10-15 minutes to complete.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Formik
        initialValues={generateInitialValues(questions, userQuestions || undefined)}
        validationSchema={generateValidationSchema(questions)}
        onSubmit={handleSubmit}
      >
        {({ isValid }) => (
          <Form>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {questions
                .sort((a: Tables<'questions'>, b: Tables<'questions'>) => (a.order || 0) - (b.order || 0))
                .map((question: Tables<'questions'>) => (
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

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={onBack}
                  disabled={isFirstStep || isSubmitting}
                  sx={{ px: 4 }}
                >
                  Back
                </Button>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    sx={{ px: 4 }}
                  >
                    Skip for Now
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !isValid}
                    sx={{ px: 4 }}
                  >
                    {isSubmitting ? 'Saving...' : isLastStep ? 'Complete Assessment' : 'Continue'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default SelfAssessmentStep;