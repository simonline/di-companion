import { CategoryEnum } from '@/utils/constants';
import type { Database } from './database';

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  given_name: string;
  family_name: string;
  gender?: string;
  position?: string;
  bio?: string;
  linkedin_profile?: string;
  avatar?: File;
  is_coach?: boolean;
  phone?: string;
  is_phone_visible?: boolean;
}

export type UpdateUser = Database['public']['Tables']['profiles']['Update'] & {
  id: string;
  avatar?: File;
  startups?: Startup[];
};

export type User = Database['public']['Tables']['profiles']['Row'] & {
  startups?: Startup[];
};

export interface SupabaseAuthResponse {
  jwt: string;
  user: User;
}

export interface SupabaseLoginCredentials {
  identifier: string;
  password: string;
}

export interface SupabaseError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export interface SupabaseRelated {
  id: string;
}

export interface SupabaseSetRelated {
  set: SupabaseRelated;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  relatedPatterns: Pattern[];
  image: {
    url: string;
  };
  phases: string[];
  category: CategoryEnum;
  methods: Method[];
  survey: Survey;
  subcategory: string;
  patternId: string;
  questions: Question[];
}

export interface Method {
  id: string;
  name: string;
  description: string;
  phases: string[];
  categories: string[];
  content: string;
  url: string;
  patterns: Pattern[];
}

export enum QuestionType {
  radio = 'radio',
  select = 'select',
  select_multiple = 'select_multiple',
  checkbox = 'checkbox',
  checkbox_multiple = 'checkbox_multiple',
  text_short = 'text_short',
  text_long = 'text_long',
  email = 'email',
  number = 'number',
  rank = 'rank',
  scale = 'scale',
}

export interface QuestionOption {
  value: string;
  label: string;
  points?: number;
  position?: number;
}

export interface ScaleOptions {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options: QuestionOption[] | ScaleOptions | null;
  isRequired: boolean;
  order: number;
  weight: number;
  helpText?: string;
  showRequestCoach?: boolean;
  maxLength?: number;
  isHidden?: boolean;
}

export interface Survey {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface Startup {
  id: string;
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
  score?: number;
  coach?: User;
  users?: User[];
  categories?: CategoryEnum[];
}

export interface CreateStartup {
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
  users?: { set: number[] };
  categories?: CategoryEnum[];
}

export interface UpdateStartup {
  id: string;
  name?: string;
  startDate?: string;
  foundersCount?: number;
  background?: string;
  productType?: string;
  idea?: string;
  industry?: string;
  industryOther?: string;
  targetMarket?: string;
  phase?: string;
  isProblemValidated?: boolean;
  qualifiedConversationsCount?: number;
  isTargetGroupDefined?: boolean;
  isPrototypeValidated?: boolean;
  isMvpTested?: boolean;
  scores?: Record<CategoryEnum, number>;
  score?: number;
  categories?: CategoryEnum[];
}

/* Startup content */
export enum ResponseTypeEnum {
  accept = 'accept',
  reject = 'reject',
}

export enum ResponseEnum {
  share_reflection = 'share_reflection',
  perform_exercise = 'perform_exercise',
  think_later = 'think_later',
  already_addressed = 'already_addressed',
  maybe_later = 'maybe_later',
  no_value = 'no_value',
  dont_understand = 'dont_understand',
}

export interface StartupPattern {
  id: string;
  startup: Startup;
  pattern: Pattern;
  createdAt: string;
  updatedAt: string;
  appliedAt: string;
  responseType: ResponseTypeEnum;
  response: ResponseEnum;
  points: number;
  user?: User;
}

export interface CreateStartupPattern {
  startup: SupabaseSetRelated;
  pattern: SupabaseSetRelated;
  responseType: ResponseTypeEnum;
  response: ResponseEnum;
  appliedAt?: string;
  points?: number;
  user?: SupabaseSetRelated;
}

export interface UpdateStartupPattern {
  id: string;
  startup?: SupabaseSetRelated;
  pattern?: SupabaseSetRelated;
  responseType?: ResponseTypeEnum;
  response?: ResponseEnum;
  appliedAt?: string;
  points?: number;
  user?: SupabaseSetRelated;
}

export interface StartupMethod {
  id: string;
  id: string;
  startup: Startup;
  pattern: Pattern;
  method: Method;
  resultFiles: string[];
  resultText: string;
}

export interface CreateStartupMethod {
  startup: SupabaseSetRelated;
  pattern: SupabaseSetRelated;
  method: SupabaseSetRelated;
  resultFiles: File[];
  resultText: string;
}

export interface UpdateStartupMethod {
  id: string;
  startup?: SupabaseSetRelated;
  pattern?: SupabaseSetRelated;
  method?: SupabaseSetRelated;
  resultFiles?: File[];
  resultText?: string;
}

export interface Recommendation {
  id: string;
  comment: string;
  type: 'pattern' | 'url' | 'file' | 'contact';
  patterns?: Pattern[];
  coach?: User;
  startup?: Startup;
  readAt?: string;
  publishedAt: string;
}

export interface Request {
  id: string;
  comment: string;
  startup?: Startup;
  readAt?: string;
  publishedAt: string;
}

export enum InvitationStatusEnum {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
}

export interface Invitation {
  id: string;
  startup: Startup;
  invitedBy: User;
  email: string;
  token: string;
  invitationStatus: InvitationStatusEnum;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CreateInvitation {
  startup: SupabaseSetRelated;
  invitedBy: SupabaseSetRelated;
  email: string;
}

export interface UpdateInvitation {
  id: string;
  invitationStatus?: InvitationStatusEnum;
}

export interface SupabaseSingleResponse<T> {
  data: T;
}

export interface SupabaseCollectionResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface UserQuestion {
  id: string;
  user: User;
  pattern: Pattern;
  question: Question;
  answer: string;
}

export interface CreateUserQuestion {
  user: SupabaseSetRelated;
  pattern?: SupabaseSetRelated;
  question: SupabaseSetRelated;
  answer: string;
}

export interface UpdateUserQuestion {
  id: string;
  user?: SupabaseSetRelated;
  pattern?: SupabaseSetRelated;
  question?: SupabaseSetRelated;
  answer?: string;
}
