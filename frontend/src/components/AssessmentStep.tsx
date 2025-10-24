import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Formik, Form, Field, FormikProps } from 'formik';
import useSurvey from '@/hooks/useSurvey';
import useQuestions from '@/hooks/useQuestions';
import useUserQuestions from '@/hooks/useUserQuestions';
import useUserQuestion from '@/hooks/useUserQuestion';
import useStartupQuestions from '@/hooks/useStartupQuestions';
import useStartupQuestion from '@/hooks/useStartupQuestion';
import useNotifications from '@/store/notifications';
import SurveyField from '@/components/SurveyField';
import { generateValidationSchema, FormValues } from '@/utils/generateValidationSchema';
import { generateInitialValues } from '@/utils/generateInitialValues';
import { Question, UserQuestion, StartupQuestion } from '@/types/database';
import { CategoryEnum } from '@/utils/constants';

export interface AssessmentStepRef {
  submit: () => Promise<void>;
  isValid: () => boolean;
}

interface AssessmentStepProps {
  category?: CategoryEnum;
  topic?: string;
  questionType: 'user' | 'startup';
  userId?: string;
  startupId?: string;
  onComplete?: () => void;
  surveyName?: string;
}

const AssessmentStep = forwardRef<AssessmentStepRef, AssessmentStepProps>(({
  category,
  topic,
  questionType,
  userId,
  startupId,
  onComplete,
  surveyName = "Self Assessment",
}, ref) => {
  const [, notificationsActions] = useNotifications();
  const { fetchSurveyByName, loading: surveyLoading, error: surveyError } = useSurvey();
  const { fetchQuestions, questions: allQuestions, loading: questionsLoading, error: questionsError } = useQuestions();

  // User questions hooks
  const {
    fetchUserQuestions,
    userQuestions,
    clearUserQuestions,
    loading: userQuestionsLoading,
    error: userQuestionsError,
  } = useUserQuestions();
  const { createUserQuestion, updateUserQuestion } = useUserQuestion();

  // Startup questions hooks
  const {
    fetchStartupQuestions,
    startupQuestions,
    clearStartupQuestions,
    loading: startupQuestionsLoading,
    error: startupQuestionsError,
  } = useStartupQuestions();
  const { createStartupQuestion, updateStartupQuestion } = useStartupQuestion();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use a ref to store the formik instance
  const formikRef = React.useRef<FormikProps<FormValues>>(null);

  // Use the questions directly since they're already filtered by the API
  const filteredQuestions = React.useMemo(() => {
    return allQuestions || [];
  }, [allQuestions]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (formikRef.current) {
        await formikRef.current.submitForm();
      }
    },
    isValid: () => {
      return formikRef.current?.isValid || false;
    },
  }));

  // Fetch survey and questions
  useEffect(() => {
    fetchSurveyByName(surveyName);
    fetchQuestions(category, topic);
  }, [fetchSurveyByName, fetchQuestions, surveyName, category, topic]);

  // Fetch existing answers
  useEffect(() => {
    if (questionType === 'user' && userId) {
      fetchUserQuestions(userId);
    } else if (questionType === 'startup' && startupId) {
      fetchStartupQuestions(startupId);
    }
  }, [questionType, userId, startupId, fetchUserQuestions, fetchStartupQuestions]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Get existing answers
      const existingAnswers = questionType === 'user' ? userQuestions : startupQuestions;
      console.log('Existing Answers:', existingAnswers);
      // Process each question's answer
      for (const question of filteredQuestions) {
        const answer = values[question.id];
        const existingResponse = existingAnswers?.find(
          (q: UserQuestion | StartupQuestion) => q.question_id === question.id
        );

        // Skip if answer is empty and question is not required
        if ((!answer || (Array.isArray(answer) && answer.length === 0)) && !question.is_required) continue;

        // Skip if answer hasn't changed
        if (existingResponse) {
          const existingAnswer = existingResponse.answer;
          if (JSON.stringify(existingAnswer) === JSON.stringify(answer)) continue;
        }

        if (questionType === 'user' && userId) {
          const payload = {
            user_id: userId,
            question_id: question.id,
            startup_id: startupId,
            answer: JSON.stringify(answer),
          };

          if (existingResponse) {
            await updateUserQuestion({
              id: existingResponse.id,
              ...payload,
            });
          } else {
            await createUserQuestion(payload);
          }
        } else if (questionType === 'startup') {
          const payload = {
            question_id: question.id,
            startup_id: startupId,
            answer: JSON.stringify(answer),
          };

          if (existingResponse) {
            await updateStartupQuestion({
              id: existingResponse.id,
              ...payload,
            });
          } else {
            await createStartupQuestion(payload);
          }
        }
      }

      // Refetch to get the updated answers
      if (questionType === 'user' && userId) {
        clearUserQuestions();
        await fetchUserQuestions(userId, startupId);
      } else if (questionType === 'startup') {
        clearStartupQuestions();
        await fetchStartupQuestions(startupId);
      }

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Answers saved successfully',
      });

      if (onComplete) {
        onComplete();
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

  // Loading state
  const loading = surveyLoading || questionsLoading ||
    (questionType === 'user' ? userQuestionsLoading : startupQuestionsLoading);

  // Error state
  const error = surveyError || questionsError ||
    (questionType === 'user' ? userQuestionsError : startupQuestionsError);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading questions: {error}
      </Alert>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No questions available for this section yet.
        </Typography>
      </Box>
    );
  }

  const existingAnswers = questionType === 'user' ? userQuestions : startupQuestions;

  return (
    <Formik
      innerRef={formikRef}
      initialValues={generateInitialValues(filteredQuestions, existingAnswers || undefined)}
      validationSchema={generateValidationSchema(filteredQuestions)}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isValid }) => (
        <Form>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredQuestions
              .sort((a: Question, b: Question) => (a.order || 0) - (b.order || 0))
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
          </Box>
        </Form>
      )}
    </Formik>
  );
});

AssessmentStep.displayName = 'AssessmentStep';

export default AssessmentStep;