import { Question, QuestionType, UserQuestion } from '@/types/supabase';
import { FormValues } from './generateValidationSchema';

export const generateInitialValues = (
  questions: Question[],
  userQuestions?: UserQuestion[],
): FormValues => {
  const values: FormValues = {};

  questions.forEach((question) => {
    const existingAnswer = userQuestions?.find(
      (uq) => uq.question.id === question.id,
    );

    if (existingAnswer?.answer !== undefined) {
      try {
        // Parse the JSON string to get the actual value
        values[question.id] = JSON.parse(existingAnswer.answer);
      } catch (error) {
        // Fallback to the raw value if parsing fails
        values[question.id] = existingAnswer.answer;
      }
    } else {
      switch (question.type) {
        case QuestionType.select_multiple:
        case QuestionType.checkbox_multiple:
        case QuestionType.rank:
          values[question.id] = [];
          break;
        case QuestionType.checkbox:
          values[question.id] = false;
          break;
        case QuestionType.number:
          values[question.id] = '';
          break;
        default:
          values[question.id] = '';
      }
    }
  });

  return values;
};
