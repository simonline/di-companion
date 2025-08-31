import * as Yup from 'yup';
import { Tables } from '@/types/database';
import { QuestionType } from '@/utils/constants';

export interface FormValues {
  [key: string]: string | string[] | number | boolean;
}

export const generateValidationSchema = (questions: Tables<'questions'>[]) => {
  const schema: { [key: string]: any } = {};

  questions.forEach((question) => {
    const fieldName = question.id;
    let validator;

    switch (question.type) {
      case QuestionType.email:
        validator = Yup.string().email('Invalid email address');
        break;
      case QuestionType.number:
        validator = Yup.number().typeError('Must be a number');
        break;
      case QuestionType.select_multiple:
      case QuestionType.rank:
      case QuestionType.checkbox_multiple:
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
