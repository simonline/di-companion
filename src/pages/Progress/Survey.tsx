import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormHelperText,
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
import { useAuth } from '@/hooks/useAuth';
import useNotifications from '@/store/notifications';

interface FormValues {
  [key: string]: string | string[] | number | boolean;
}

const Survey: React.FC = () => {
  const { patternId } = useParams<{ patternId: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [, notificationsActions] = useNotifications();
  const { startup, updateScores } = useAuth();
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

  const renderField = (question: Question, { field, form }: any) => {
    const error = form.touched[question.documentId] && form.errors[question.documentId];
    switch (question.type) {
      case QuestionType.radio:
        return (
          <FormControl component="fieldset" error={!!error} fullWidth>
            <FormLabel component="legend">{question.question}</FormLabel>
            <RadioGroup {...field} row>
              {question.options &&
                question.options.map(({ value, label }) => (
                  <FormControlLabel
                    key={value}
                    value={value}
                    control={<Radio sx={{ p: 0.5 }} />}
                    label={label}
                    sx={{
                      margin: 0, // Remove margin around each FormControlLabel
                      mr: 1, // Add small right margin between items to space them out slightly
                      '& .MuiTypography-root': {
                        fontSize: '0.875rem', // Adjust font size of label
                      },
                    }}
                  />
                ))}
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case QuestionType.select:
        return (
          <FormControl fullWidth error={!!error}>
            <FormLabel>{question.question}</FormLabel>
            <Select {...field}>
              {question.options &&
                question.options.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case QuestionType.select_multiple:
        return (
          <FormControl fullWidth error={!!error}>
            <FormLabel>{question.question}</FormLabel>
            <Select
              {...field}
              multiple
              renderValue={(selected: string[]) =>
                selected.map((value: any) => question.options?.[value]).join(', ')
              }
            >
              {question.options &&
                question.options.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    <Checkbox checked={field.value.includes(value)} />
                    {label}
                  </MenuItem>
                ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case QuestionType.checkbox:
        return (
          <FormControl component="fieldset" error={!!error} fullWidth>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label={question.question}
              />
            </FormGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case QuestionType.text_long:
        return (
          <TextField
            {...field}
            fullWidth
            label={question.question}
            multiline
            rows={4}
            error={!!error}
            helperText={error}
          />
        );

      case QuestionType.email:
        return (
          <TextField
            {...field}
            fullWidth
            label={question.question}
            type="email"
            error={!!error}
            helperText={error}
          />
        );

      case QuestionType.number:
        return (
          <TextField
            {...field}
            fullWidth
            label={question.question}
            type="number"
            error={!!error}
            helperText={error}
          />
        );

      default: // text_short
        return (
          <TextField
            {...field}
            fullWidth
            label={question.question}
            error={!!error}
            helperText={error}
          />
        );
    }
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
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" sx={{ mb: 4 }}>
            {survey.description}
          </Typography>

          <Formik
            initialValues={generateInitialValues(survey.questions)}
            validationSchema={generateValidationSchema(survey.questions)}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 0 }}>
                  {survey.questions
                    .sort((a, b) => a.order - b.order)
                    .map((question) => (
                      <Field key={question.documentId} name={question.documentId}>
                        {(fieldProps: any) => renderField(question, fieldProps)}
                      </Field>
                    ))}

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{ mt: 2 }}
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
              </Form>
            )}
          </Formik>
        </Box>
      </CenteredFlexBox>
    </>
  );
};

export default Survey;
