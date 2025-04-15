import { Question, QuestionType, UserQuestion } from '@/types/strapi';
import { FormValues } from './generateValidationSchema';

export const generateInitialValues = (
  questions: Question[],
  userQuestions?: UserQuestion[],
): FormValues => {
  const values: FormValues = {};

  questions.forEach((question) => {
    const existingAnswer = userQuestions?.find(
      (uq) => uq.question.documentId === question.documentId,
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
