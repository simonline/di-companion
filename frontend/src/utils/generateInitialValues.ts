import { Tables } from '@/types/database';
import { FormValues } from './generateValidationSchema';

export const generateInitialValues = (
  questions: Tables<'questions'>[],
  userQuestions?: Tables<'user_questions'>[],
): FormValues => {
  const values: FormValues = {};

  questions.forEach((question) => {
    const existingAnswer = userQuestions?.find(
      (uq) => uq.question_id === question.id,
    );

    if (existingAnswer?.answer !== undefined && existingAnswer.answer !== null) {
      try {
        // Parse the JSON string to get the actual value
        values[question.id] = typeof existingAnswer.answer === 'string' 
          ? JSON.parse(existingAnswer.answer)
          : existingAnswer.answer;
      } catch (error) {
        // Fallback to the raw value if parsing fails
        values[question.id] = existingAnswer.answer;
      }
    } else {
      switch (question.type) {
        case 'select_multiple':
        case 'checkbox_multiple':
        case 'rank':
          values[question.id] = [];
          break;
        case 'checkbox':
          values[question.id] = false;
          break;
        case 'number':
          values[question.id] = '';
          break;
        default:
          values[question.id] = '';
      }
    }
  });

  return values;
};
