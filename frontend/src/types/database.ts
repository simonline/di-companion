import { MergeDeep } from 'type-fest'
import { Database as DatabaseGenerated } from './database-generated'
import {
  QuestionOption,
  QuestionType,
  ResponseEnum,
  ResponseTypeEnum,
  ScaleOptions
} from '@/utils/constants'

// Custom types
export interface User {
  id: string;
}
export type UserCreate = Omit<User, 'id'>;
export type UserUpdate = Partial<User>;

// Merge custom types with generated database
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      'patterns': {
        Row: {
          name: string
        },
        Insert: {
          name: string
        },
        Update: {
          name: string
        }
      },
      'questions': {
        Row: {
          options: QuestionOption[] | ScaleOptions | null,
          type: QuestionType
        },
        Insert: {
          options: QuestionOption[] | ScaleOptions | null
          type: QuestionType
        },
        Update: {
          options: QuestionOption[] | ScaleOptions | null,
          type: QuestionType
        }
      },
      'startup_patterns': {
        Row: {
          responseType: ResponseTypeEnum,
          response: ResponseEnum
        }
        Insert: {
          responseType: ResponseTypeEnum,
          response: ResponseEnum
        }
        Update: {
          responseType: ResponseTypeEnum,
          response: ResponseEnum
        }
      },
    }
  }
>

// Export convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]

// Re-export Json type
export type { Json } from './database-generated'