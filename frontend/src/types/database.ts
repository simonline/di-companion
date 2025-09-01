import { Database } from './database-generated'
import {
  CategoryEnum,
  QuestionOption,
  QuestionType,
  ResponseEnum,
  ResponseTypeEnum,
  ScaleOptions
} from '@/utils/constants'


// Export convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]

export type { Database, Json } from './database-generated'

// User
export interface User {
  id: string;
  email: string;
  password?: string;
}
export type UserCreate = Omit<User, 'id'>;
export type UserUpdate = Partial<User>;

// Profiles
export interface Profile extends Tables<'profiles'> {
  avatar?: { url: string | null }
  user?: User
}

export interface ProfileCreate extends Omit<TablesInsert<'profiles'>, 'id'> {
  avatarFile?: File;
}
export type ProfileUpdate = TablesUpdate<'profiles'>;

// Exercises
export type Exercise = Tables<'exercises'>;
export type ExerciseCreate = TablesInsert<'exercises'>;
export type ExerciseUpdate = TablesUpdate<'exercises'>;

// Files
export type FileRecord = Tables<'files'>;
export type FileRecordCreate = TablesInsert<'files'>;
export type FileRecordUpdate = TablesUpdate<'files'>;

// Documents
export type Document = Tables<'documents'>;
export type DocumentCreate = TablesInsert<'documents'>;
export type DocumentUpdate = TablesUpdate<'documents'>;

// Invitations
export type Invitation = Tables<'invitations'>;
export type InvitationCreate = TablesInsert<'invitations'>;
export type InvitationUpdate = TablesUpdate<'invitations'>;

// Methods
export interface Method extends Tables<'methods'> {
  image?: { url: string | null }
}
export type MethodCreate = TablesInsert<'methods'>;
export type MethodUpdate = TablesUpdate<'methods'>;

// Method Links
export type MethodPatternLink = Tables<'methods_patterns_lnk'>;
export type MethodPatternLinkCreate = TablesInsert<'methods_patterns_lnk'>;
export type MethodPatternLinkUpdate = TablesUpdate<'methods_patterns_lnk'>;

// Patterns
export interface Pattern extends Tables<'patterns'> {
  name: string
  image?: { url: string | null }
  survey?: Survey;
  related_patterns?: Pattern[];
}
export type PatternCreate = TablesInsert<'patterns'>;
export type PatternUpdate = TablesUpdate<'patterns'>;

// Pattern Links
export type PatternExerciseLink = Tables<'patterns_exercise_lnk'>;
export type PatternExerciseLinkCreate = TablesInsert<'patterns_exercise_lnk'>;
export type PatternExerciseLinkUpdate = TablesUpdate<'patterns_exercise_lnk'>;

export type PatternRelatedPatternLink = Tables<'patterns_related_patterns_lnk'>;
export type PatternRelatedPatternLinkCreate = TablesInsert<'patterns_related_patterns_lnk'>;
export type PatternRelatedPatternLinkUpdate = TablesUpdate<'patterns_related_patterns_lnk'>;

export type PatternSurveyLink = Tables<'patterns_survey_lnk'>;
export type PatternSurveyLinkCreate = TablesInsert<'patterns_survey_lnk'>;
export type PatternSurveyLinkUpdate = TablesUpdate<'patterns_survey_lnk'>;

// Questions
export interface Question extends Omit<Tables<'questions'>, 'options' | 'type'> {
  options: QuestionOption[] | ScaleOptions | null;
  type: QuestionType;
}
export type QuestionCreate = TablesInsert<'questions'>;
export type QuestionUpdate = TablesUpdate<'questions'>;

// Question Links
export type QuestionPatternLink = Tables<'questions_patterns_lnk'>;
export type QuestionPatternLinkCreate = TablesInsert<'questions_patterns_lnk'>;
export type QuestionPatternLinkUpdate = TablesUpdate<'questions_patterns_lnk'>;

export type QuestionSurveyLink = Tables<'questions_survey_lnk'>;
export type QuestionSurveyLinkCreate = TablesInsert<'questions_survey_lnk'>;
export type QuestionSurveyLinkUpdate = TablesUpdate<'questions_survey_lnk'>;

// Recommendations
export interface Recommendation extends Tables<'recommendations'> {
  type: string;
  patterns?: Pattern[];
  coach?: User;
  startup?: Startup;
}
export type RecommendationCreate = TablesInsert<'recommendations'>;
export type RecommendationUpdate = TablesUpdate<'recommendations'>;

// Recommendation Links
export type RecommendationPatternLink = Tables<'recommendations_patterns_lnk'>;
export type RecommendationPatternLinkCreate = TablesInsert<'recommendations_patterns_lnk'>;
export type RecommendationPatternLinkUpdate = TablesUpdate<'recommendations_patterns_lnk'>;

// Requests
export type Request = Tables<'requests'>;
export type RequestCreate = TablesInsert<'requests'>;
export type RequestUpdate = TablesUpdate<'requests'>;

// Startup Methods
export type StartupMethod = Tables<'startup_methods'>;
export type StartupMethodCreate = TablesInsert<'startup_methods'>;
export type StartupMethodUpdate = TablesUpdate<'startup_methods'>;

// Startup Patterns
export interface StartupPattern extends Tables<'startup_patterns'> {
  response_type: ResponseTypeEnum;
  response: ResponseEnum;
  pattern?: any;
  startup?: any;
}
export type StartupPatternCreate = TablesInsert<'startup_patterns'>;
export type StartupPatternUpdate = TablesUpdate<'startup_patterns'>;

// Startup Questions
export type StartupQuestion = Tables<'startup_questions'>;
export type StartupQuestionCreate = TablesInsert<'startup_questions'>;
export type StartupQuestionUpdate = TablesUpdate<'startup_questions'>;

// Startups
export interface Startup extends Tables<'startups'> {
  logo?: { url: string | null }
  categories: CategoryEnum[]
}
export type StartupCreate = TablesInsert<'startups'>;
export type StartupUpdate = TablesUpdate<'startups'>;

// Startup User Links
export type StartupUserLink = Tables<'startups_users_lnk'>;
export type StartupUserLinkCreate = TablesInsert<'startups_users_lnk'>;
export type StartupUserLinkUpdate = TablesUpdate<'startups_users_lnk'>;

// Surveys
export interface Survey extends Tables<'surveys'> {
  questions?: Question[];
}
export type SurveyCreate = TablesInsert<'surveys'>;
export type SurveyUpdate = TablesUpdate<'surveys'>;

// User Questions
export interface UserQuestion extends Tables<'user_questions'> {
  question: Question;
  pattern?: Pattern;
}
export type UserQuestionCreate = TablesInsert<'user_questions'>;
export type UserQuestionUpdate = TablesUpdate<'user_questions'>;
