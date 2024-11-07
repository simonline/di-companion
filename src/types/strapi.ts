import { CategoryEnum, PhaseEnum } from '@/utils/constants';

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  givenName: string;
  familyName: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  givenName: string;
  familyName: string;
  startups: Startup[];
}

export interface StrapiAuthResponse {
  jwt: string;
  user: User;
}

export interface StrapiLoginCredentials {
  identifier: string;
  password: string;
}

export interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export interface Pattern {
  documentId: string;
  name: string;
  description: string;
  image: {
    url: string;
  };
  category: CategoryEnum;
  phases: PhaseEnum[];
  relatedPatterns: Pattern[];
}

export interface StrapiPatternsResponse {
  data: Pattern[];
}

export interface StrapiPatternResponse {
  data: Pattern;
}

export interface Exercise {
  name: string;
  description: string;
}

export interface StrapiExercisesResponse {
  data: Exercise[];
}

export enum QuestionType {
  radio,
  select,
  select_multiple,
  checkbox,
  text_short,
  text_long,
  email,
  number,
}

export interface Question {
  question: string;
  type: QuestionType;
  options: Record<string, string> | null;
  isRequired: boolean;
  order: number;
}

export interface StrapiQuestionsResponse {
  data: Question[];
}

export interface Survey {
  name: string;
  description: string;
  questions: Question[];
}

export interface StrapiSurveysResponse {
  data: Survey[];
}

export interface Startup {
  documentId?: string;
  name: string;
  startDate: string;
  foundersCount: number;
  background: string;
  productType: string;
  idea: string;
  industry: string;
  industryOther?: string;
  targetMarket: string;
  phase: string;
  isProblemValidated: boolean;
  qualifiedConversationsCount: number;
  isTargetGroupDefined: boolean;
  isPrototypeValidated: boolean;
  isMvpTested: boolean;
  scores?: Record<CategoryEnum, number>;
}

export interface StrapiStartupsResponse {
  data: Startup[];
}

/* Startup content */
export interface StartupPattern {
  documentId: string;
  startup: Startup;
  pattern: Pattern;
  finishedAt: string;
  updatedAt: string;
}

export interface StrapiStartupPatternsResponse {
  data: StartupPattern[];
}

export interface StartupExercise {
  startup: Startup;
  pattern: Pattern;
  exercise: Exercise;
  resultFiles: string[];
  resultText: string;
}

export interface StrapiStartupExercisesResponse {
  data: StartupExercise[];
}

export interface StartupQuestion {
  startup: Startup;
  pattern: Pattern;
  question: Question;
  answer: string;
}

export interface StrapiStartupQuestionsResponse {
  data: StartupQuestion[];
}

export interface Recommendation {
  documentId: string;
  recommendation: string;
  type: 'pattern' | 'url' | 'file' | 'contact';
  text: string;
  isRead: boolean;
  publishedAt: string;
}

export interface StrapiRecommendationsResponse {
  data: Recommendation[];
}
