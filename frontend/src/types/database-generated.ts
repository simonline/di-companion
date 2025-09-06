export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      document_uploads: {
        Row: {
          ai_analysis: Json | null
          analyzed_at: string | null
          created_at: string
          created_by_id: string | null
          description: string | null
          document_id: string | null
          duration: string | null
          id: string
          insights: Json | null
          language: string | null
          locale: string | null
          metadata: Json | null
          mode: string | null
          published_at: string | null
          status: string | null
          summary: string | null
          tags: Json | null
          title: string | null
          transcription: string | null
          type: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          analyzed_at?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          duration?: string | null
          id?: string
          insights?: Json | null
          language?: string | null
          locale?: string | null
          metadata?: Json | null
          mode?: string | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          tags?: Json | null
          title?: string | null
          transcription?: string | null
          type?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          analyzed_at?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          duration?: string | null
          id?: string
          insights?: Json | null
          language?: string | null
          locale?: string | null
          metadata?: Json | null
          mode?: string | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          tags?: Json | null
          title?: string | null
          transcription?: string | null
          type?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: []
      }
      document_uploads_startup_lnk: {
        Row: {
          document_upload_id: string | null
          id: string
          startup_id: string | null
        }
        Insert: {
          document_upload_id?: string | null
          id?: string
          startup_id?: string | null
        }
        Update: {
          document_upload_id?: string | null
          id?: string
          startup_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_uploads_startup_lnk_fk"
            columns: ["document_upload_id"]
            isOneToOne: false
            referencedRelation: "document_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_uploads_startup_lnk_ifk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      document_uploads_user_lnk: {
        Row: {
          document_upload_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          document_upload_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          document_upload_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_uploads_user_lnk_fk"
            columns: ["document_upload_id"]
            isOneToOne: false
            referencedRelation: "document_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by_id: string | null
          description: string | null
          document_id: string | null
          id: string
          locale: string | null
          name: string | null
          published_at: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          id: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          bucket: string
          storage_path: string
          category: string | null
          entity_type: string | null
          entity_id: string | null
          is_public: boolean
          signed_url_expires_in: number
          uploaded_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          bucket?: string
          storage_path: string
          category?: string | null
          entity_type?: string | null
          entity_id?: string | null
          is_public?: boolean
          signed_url_expires_in?: number
          uploaded_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          filename?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          bucket?: string
          storage_path?: string
          category?: string | null
          entity_type?: string | null
          entity_id?: string | null
          is_public?: boolean
          signed_url_expires_in?: number
          uploaded_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      files_folder_lnk: {
        Row: {
          file_id: string | null
          file_ord: number | null
          folder_id: string | null
          id: string
        }
        Insert: {
          file_id?: string | null
          file_ord?: number | null
          folder_id?: string | null
          id?: string
        }
        Update: {
          file_id?: string | null
          file_ord?: number | null
          folder_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_folder_lnk_fk"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_folder_lnk_ifk"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "upload_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      files_related_mph: {
        Row: {
          field: string | null
          file_id: string | null
          id: string
          order: number | null
          related_id: string | null
          related_type: string | null
        }
        Insert: {
          field?: string | null
          file_id?: string | null
          id?: string
          order?: number | null
          related_id?: string | null
          related_type?: string | null
        }
        Update: {
          field?: string | null
          file_id?: string | null
          id?: string
          order?: number | null
          related_id?: string | null
          related_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_related_mph_fk"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          id: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          bucket: string
          storage_path: string
          category: string | null
          uploaded_by: string | null
          uploaded_at: string
          entity_type: string | null
          entity_id: string | null
          entity_field: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          bucket?: string
          storage_path: string
          category?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
          entity_type?: string | null
          entity_id?: string | null
          entity_field?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          filename?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          bucket?: string
          storage_path?: string
          category?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
          entity_type?: string | null
          entity_id?: string | null
          entity_field?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      i18n_locale: {
        Row: {
          code: string | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          name: string | null
          published_at: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          created_by_id: string | null
          document_id: string | null
          email: string | null
          expires_at: string | null
          id: string
          invitation_status: string | null
          invited_by_id: string | null
          locale: string | null
          published_at: string | null
          startup_id: string | null
          token: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invitation_status?: string | null
          invited_by_id?: string | null
          locale?: string | null
          published_at?: string | null
          startup_id?: string | null
          token?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invitation_status?: string | null
          invited_by_id?: string | null
          locale?: string | null
          published_at?: string | null
          startup_id?: string | null
          token?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_startup_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      methods: {
        Row: {
          categories: Json | null
          content: string | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          image_id: string | null
          locale: string | null
          name: string | null
          phases: Json | null
          published_at: string | null
          updated_at: string
          updated_by_id: string | null
          url: string | null
        }
        Insert: {
          categories?: Json | null
          content?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          image_id?: string | null
          locale?: string | null
          name?: string | null
          phases?: Json | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
          url?: string | null
        }
        Update: {
          categories?: Json | null
          content?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          image_id?: string | null
          locale?: string | null
          name?: string | null
          phases?: Json | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
          url?: string | null
        }
        Relationships: []
      }
      methods_patterns_lnk: {
        Row: {
          id: string
          method_id: string | null
          method_ord: number | null
          pattern_id: string | null
          pattern_ord: number | null
        }
        Insert: {
          id?: string
          method_id?: string | null
          method_ord?: number | null
          pattern_id?: string | null
          pattern_ord?: number | null
        }
        Update: {
          id?: string
          method_id?: string | null
          method_ord?: number | null
          pattern_id?: string | null
          pattern_ord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "methods_patterns_lnk_fk"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "methods_patterns_lnk_ifk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      patterns: {
        Row: {
          category: string | null
          created_at: string
          created_by_id: string | null
          description: string | null
          document_id: string | null
          id: string
          image_id: string | null
          locale: string | null
          name: string | null
          pattern_id: string | null
          phases: Json | null
          published_at: string | null
          subcategory: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          image_id?: string | null
          locale?: string | null
          name?: string | null
          pattern_id?: string | null
          phases?: Json | null
          published_at?: string | null
          subcategory?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          image_id?: string | null
          locale?: string | null
          name?: string | null
          pattern_id?: string | null
          phases?: Json | null
          published_at?: string | null
          subcategory?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: []
      }
      patterns_exercise_lnk: {
        Row: {
          exercise_id: string | null
          id: string
          pattern_id: string | null
        }
        Insert: {
          exercise_id?: string | null
          id?: string
          pattern_id?: string | null
        }
        Update: {
          exercise_id?: string | null
          id?: string
          pattern_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patterns_exercise_lnk_fk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patterns_exercise_lnk_ifk"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      patterns_related_patterns_lnk: {
        Row: {
          id: string
          inv_pattern_id: string | null
          pattern_id: string | null
          pattern_ord: number | null
        }
        Insert: {
          id?: string
          inv_pattern_id?: string | null
          pattern_id?: string | null
          pattern_ord?: number | null
        }
        Update: {
          id?: string
          inv_pattern_id?: string | null
          pattern_id?: string | null
          pattern_ord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patterns_related_patterns_lnk_fk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patterns_related_patterns_lnk_ifk"
            columns: ["inv_pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      patterns_survey_lnk: {
        Row: {
          id: string
          pattern_id: string | null
          survey_id: string | null
        }
        Insert: {
          id?: string
          pattern_id?: string | null
          survey_id?: string | null
        }
        Update: {
          id?: string
          pattern_id?: string | null
          survey_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patterns_survey_lnk_fk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patterns_survey_lnk_ifk"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_id: string | null
          bio: string | null
          created_at: string | null
          family_name: string | null
          firstname: string | null
          gender: string | null
          given_name: string | null
          id: string
          is_coach: boolean | null
          is_phone_visible: boolean | null
          lastname: string | null
          linkedin_profile: string | null
          locale: string | null
          phone: string | null
          position: string | null
          progress: Json | null
          updated_at: string | null
          username: string | null
          email: string | null
        }
        Insert: {
          avatar_id?: string | null
          bio?: string | null
          created_at?: string | null
          family_name?: string | null
          firstname?: string | null
          gender?: string | null
          given_name?: string | null
          id: string
          is_coach?: boolean | null
          is_phone_visible?: boolean | null
          lastname?: string | null
          linkedin_profile?: string | null
          locale?: string | null
          phone?: string | null
          position?: string | null
          progress?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_id?: string | null
          bio?: string | null
          created_at?: string | null
          family_name?: string | null
          firstname?: string | null
          gender?: string | null
          given_name?: string | null
          id?: string
          is_coach?: boolean | null
          is_phone_visible?: boolean | null
          lastname?: string | null
          linkedin_profile?: string | null
          locale?: string | null
          phone?: string | null
          position?: string | null
          progress?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          categories: Json | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          help_text: string | null
          id: string
          is_hidden: boolean | null
          is_required: boolean | null
          locale: string | null
          max_length: string | null
          options: Json | null
          order: number | null
          phases: Json | null
          published_at: string | null
          question: string | null
          show_request_coach: boolean | null
          type: string | null
          updated_at: string
          updated_by_id: string | null
          weight: number | null
          topic: string | null
        }
        Insert: {
          categories?: Json | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          help_text?: string | null
          id?: string
          is_hidden?: boolean | null
          is_required?: boolean | null
          locale?: string | null
          max_length?: string | null
          options?: Json | null
          order?: number | null
          phases?: Json | null
          published_at?: string | null
          question?: string | null
          show_request_coach?: boolean | null
          type?: string | null
          updated_at?: string
          updated_by_id?: string | null
          weight?: number | null
          topic: string | null
        }
        Update: {
          categories?: Json | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          help_text?: string | null
          id?: string
          is_hidden?: boolean | null
          is_required?: boolean | null
          locale?: string | null
          max_length?: string | null
          options?: Json | null
          order?: number | null
          phases?: Json | null
          published_at?: string | null
          question?: string | null
          show_request_coach?: boolean | null
          type?: string | null
          updated_at?: string
          updated_by_id?: string | null
          weight?: number | null
          topic: string | null
        }
        Relationships: []
      }
      questions_patterns_lnk: {
        Row: {
          id: string
          pattern_id: string | null
          pattern_ord: number | null
          question_id: string | null
          question_ord: number | null
        }
        Insert: {
          id?: string
          pattern_id?: string | null
          pattern_ord?: number | null
          question_id?: string | null
          question_ord?: number | null
        }
        Update: {
          id?: string
          pattern_id?: string | null
          pattern_ord?: number | null
          question_id?: string | null
          question_ord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_patterns_lnk_fk"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_patterns_lnk_ifk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      questions_survey_lnk: {
        Row: {
          id: string
          question_id: string | null
          question_ord: number | null
          survey_id: string | null
        }
        Insert: {
          id?: string
          question_id?: string | null
          question_ord?: number | null
          survey_id?: string | null
        }
        Update: {
          id?: string
          question_id?: string | null
          question_ord?: number | null
          survey_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_survey_lnk_fk"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_survey_lnk_ifk"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          coach_id: string | null
          comment: string | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          published_at: string | null
          read_at: string | null
          startup_id: string | null
          type: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          coach_id?: string | null
          comment?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          published_at?: string | null
          read_at?: string | null
          startup_id?: string | null
          type?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          coach_id?: string | null
          comment?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          published_at?: string | null
          read_at?: string | null
          startup_id?: string | null
          type?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_startup_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations_patterns_lnk: {
        Row: {
          id: string
          pattern_id: string | null
          pattern_ord: number | null
          recommendation_id: string | null
        }
        Insert: {
          id?: string
          pattern_id?: string | null
          pattern_ord?: number | null
          recommendation_id?: string | null
        }
        Update: {
          id?: string
          pattern_id?: string | null
          pattern_ord?: number | null
          recommendation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_patterns_lnk_fk"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_patterns_lnk_ifk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          comment: string | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          published_at: string | null
          read_at: string | null
          startup_id: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          published_at?: string | null
          read_at?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          published_at?: string | null
          read_at?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_startup_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_methods: {
        Row: {
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          method_id: string | null
          pattern_id: string | null
          published_at: string | null
          result_text: string | null
          startup_id: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          method_id?: string | null
          pattern_id?: string | null
          published_at?: string | null
          result_text?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          method_id?: string | null
          pattern_id?: string | null
          published_at?: string | null
          result_text?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_methods_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "startup_methods_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_methods_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "startup_methods_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_methods_method_fk"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_methods_pattern_fk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_methods_startup_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_patterns: {
        Row: {
          applied_at: string | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          pattern_id: string | null
          points: number | null
          published_at: string | null
          response: string | null
          response_type: string | null
          startup_id: string | null
          updated_at: string
          updated_by_id: string | null
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          pattern_id?: string | null
          points?: number | null
          published_at?: string | null
          response?: string | null
          response_type?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          pattern_id?: string | null
          points?: number | null
          published_at?: string | null
          response?: string | null
          response_type?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_patterns_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "startup_patterns_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_patterns_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "startup_patterns_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_patterns_pattern_fk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_patterns_startup_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_questions: {
        Row: {
          answer: Json | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          pattern_id: string | null
          published_at: string | null
          question_id: string | null
          startup_id: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          answer?: Json | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          pattern_id?: string | null
          published_at?: string | null
          question_id?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          answer?: Json | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          pattern_id?: string | null
          published_at?: string | null
          question_id?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_questions_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "startup_questions_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_questions_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "startup_questions_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_questions_pattern_fk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_questions_question_fk"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_questions_startup_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          background: string | null
          categories: Json | null
          coach_id: string | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          founders_count: number | null
          id: string
          idea: string | null
          industry: string | null
          industry_other: string | null
          internal_comment: string | null
          is_mvp_tested: boolean | null
          is_problem_validated: boolean | null
          is_prototype_validated: boolean | null
          is_target_group_defined: boolean | null
          locale: string | null
          logo_id: string | null
          name: string | null
          phase: string | null
          product_type: string | null
          progress: Json | null
          published_at: string | null
          qualified_conversations_count: number | null
          score: number | null
          scores: Json | null
          start_date: string | null
          target_market: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          background?: string | null
          categories?: Json | null
          coach_id?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          founders_count?: number | null
          id?: string
          idea?: string | null
          industry?: string | null
          industry_other?: string | null
          internal_comment?: string | null
          is_mvp_tested?: boolean | null
          is_problem_validated?: boolean | null
          is_prototype_validated?: boolean | null
          is_target_group_defined?: boolean | null
          locale?: string | null
          logo_id?: string | null
          name?: string | null
          phase?: string | null
          product_type?: string | null
          progress?: Json | null
          published_at?: string | null
          qualified_conversations_count?: number | null
          score?: number | null
          scores?: Json | null
          start_date?: string | null
          target_market?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          background?: string | null
          categories?: Json | null
          coach_id?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          founders_count?: number | null
          id?: string
          idea?: string | null
          industry?: string | null
          industry_other?: string | null
          internal_comment?: string | null
          is_mvp_tested?: boolean | null
          is_problem_validated?: boolean | null
          is_prototype_validated?: boolean | null
          is_target_group_defined?: boolean | null
          locale?: string | null
          logo_id?: string | null
          name?: string | null
          phase?: string | null
          product_type?: string | null
          progress?: Json | null
          published_at?: string | null
          qualified_conversations_count?: number | null
          score?: number | null
          scores?: Json | null
          start_date?: string | null
          target_market?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: []
      }
      startups_users_lnk: {
        Row: {
          id: string
          startup_id: string | null
          startup_ord: number | null
          user_id: string | null
          user_ord: number | null
        }
        Insert: {
          id?: string
          startup_id?: string | null
          startup_ord?: number | null
          user_id?: string | null
          user_ord?: number | null
        }
        Update: {
          id?: string
          startup_id?: string | null
          startup_ord?: number | null
          user_id?: string | null
          user_ord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "startups_users_lnk_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          }
        ]
      }
      surveys: {
        Row: {
          created_at: string
          created_by_id: string | null
          description: string | null
          document_id: string | null
          id: string
          locale: string | null
          name: string | null
          published_at: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: []
      }
      up_permissions: {
        Row: {
          action: string | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: number
          locale: string | null
          published_at: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: number
          locale?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: number
          locale?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "up_permissions_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "up_permissions_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "up_permissions_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "up_permissions_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
        ]
      }
      up_permissions_role_lnk: {
        Row: {
          id: number
          permission_id: number | null
          permission_ord: number | null
          role_id: number | null
        }
        Insert: {
          id?: number
          permission_id?: number | null
          permission_ord?: number | null
          role_id?: number | null
        }
        Update: {
          id?: number
          permission_id?: number | null
          permission_ord?: number | null
          role_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "up_permissions_role_lnk_fk"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "up_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "up_permissions_role_lnk_ifk"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "up_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      up_roles: {
        Row: {
          created_at: string
          created_by_id: string | null
          description: string | null
          document_id: string | null
          id: number
          locale: string | null
          name: string | null
          published_at: string | null
          type: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          id?: number
          locale?: string | null
          name?: string | null
          published_at?: string | null
          type?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          document_id?: string | null
          id?: number
          locale?: string | null
          name?: string | null
          published_at?: string | null
          type?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "up_roles_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "up_roles_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "up_roles_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "up_roles_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
        ]
      }
      up_users: {
        Row: {
          bio: string | null
          blocked: boolean | null
          confirmation_token: string | null
          confirmed: boolean | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          email: string | null
          family_name: string | null
          gender: string | null
          given_name: string | null
          id: number
          is_coach: boolean | null
          is_phone_visible: boolean | null
          linkedin_profile: string | null
          locale: string | null
          password: string | null
          phone: string | null
          position: string | null
          provider: string | null
          published_at: string | null
          reset_password_token: string | null
          updated_at: string
          updated_by_id: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          blocked?: boolean | null
          confirmation_token?: string | null
          confirmed?: boolean | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          email?: string | null
          family_name?: string | null
          gender?: string | null
          given_name?: string | null
          id?: number
          is_coach?: boolean | null
          is_phone_visible?: boolean | null
          linkedin_profile?: string | null
          locale?: string | null
          password?: string | null
          phone?: string | null
          position?: string | null
          provider?: string | null
          published_at?: string | null
          reset_password_token?: string | null
          updated_at?: string
          updated_by_id?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          blocked?: boolean | null
          confirmation_token?: string | null
          confirmed?: boolean | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          email?: string | null
          family_name?: string | null
          gender?: string | null
          given_name?: string | null
          id?: number
          is_coach?: boolean | null
          is_phone_visible?: boolean | null
          linkedin_profile?: string | null
          locale?: string | null
          password?: string | null
          phone?: string | null
          position?: string | null
          provider?: string | null
          published_at?: string | null
          reset_password_token?: string | null
          updated_at?: string
          updated_by_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "up_users_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "up_users_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "up_users_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "up_users_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
        ]
      }
      up_users_role_lnk: {
        Row: {
          id: number
          role_id: number | null
          user_id: number | null
          user_ord: number | null
        }
        Insert: {
          id?: number
          role_id?: number | null
          user_id?: number | null
          user_ord?: number | null
        }
        Update: {
          id?: number
          role_id?: number | null
          user_id?: number | null
          user_ord?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "up_users_role_lnk_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "up_users_role_lnk_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "up_users_role_lnk_ifk"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "up_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_folders: {
        Row: {
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          name: string | null
          path: string | null
          path_id: string | null
          published_at: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          path?: string | null
          path_id?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          path?: string | null
          path_id?: string | null
          published_at?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: []
      }
      upload_folders_parent_lnk: {
        Row: {
          folder_id: string | null
          folder_ord: number | null
          id: string
          inv_folder_id: string | null
        }
        Insert: {
          folder_id?: string | null
          folder_ord?: number | null
          id?: string
          inv_folder_id?: string | null
        }
        Update: {
          folder_id?: string | null
          folder_ord?: number | null
          id?: string
          inv_folder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upload_folders_parent_lnk_fk"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "upload_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upload_folders_parent_lnk_ifk"
            columns: ["inv_folder_id"]
            isOneToOne: false
            referencedRelation: "upload_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_migrations: {
        Row: {
          auth_user_id: string
          created_at: string | null
          legacy_up_user_id: number
        }
        Insert: {
          auth_user_id: string
          created_at?: string | null
          legacy_up_user_id: number
        }
        Update: {
          auth_user_id?: string
          created_at?: string | null
          legacy_up_user_id?: number
        }
        Relationships: []
      }
      user_questions: {
        Row: {
          answer: Json | null
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          pattern_id: string | null
          published_at: string | null
          question_id: string | null
          startup_id: string | null
          updated_at: string
          updated_by_id: string | null
          user_id: string | null
        }
        Insert: {
          answer?: Json | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          pattern_id?: string | null
          published_at?: string | null
          question_id?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: Json | null
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          pattern_id?: string | null
          published_at?: string | null
          question_id?: string | null
          startup_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_questions_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "user_questions_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_questions_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "user_questions_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_questions_pattern_fk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_questions_question_fk"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_questions_startup_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_methods: {
        Row: {
          created_at: string
          created_by_id: string | null
          document_id: string | null
          id: string
          locale: string | null
          method_id: string | null
          pattern_id: string | null
          published_at: string | null
          result_text: string | null
          startup_id: string | null
          user_id: string | null
          updated_at: string
          updated_by_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          method_id?: string | null
          pattern_id?: string | null
          published_at?: string | null
          result_text?: string | null
          startup_id?: string | null
          user_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_id?: string | null
          document_id?: string | null
          id?: string
          locale?: string | null
          method_id?: string | null
          pattern_id?: string | null
          published_at?: string | null
          result_text?: string | null
          startup_id?: string | null
          user_id?: string | null
          updated_at?: string
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_methods_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "startup_methods_created_by_id_fk"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_methods_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "_up_users_staging"
            referencedColumns: ["legacy_up_user_id"]
          },
          {
            foreignKeyName: "startup_methods_updated_by_id_fk"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "up_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_methods_method_fk"
            columns: ["method_id"]
            isOneToOne: false
            referencedRelation: "methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_methods_pattern_fk"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_methods_startup_fk"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      file_migrations: {
        Row: {
          id: number
          strapi_file_id: number
          new_file_id: string | null
          original_path: string
          new_s3_key: string | null
          migration_status: string
          error_message: string | null
          migrated_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          strapi_file_id: number
          new_file_id?: string | null
          original_path: string
          new_s3_key?: string | null
          migration_status?: string
          error_message?: string | null
          migrated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          strapi_file_id?: number
          new_file_id?: string | null
          original_path?: string
          new_s3_key?: string | null
          migration_status?: string
          error_message?: string | null
          migrated_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_migrations_new_file_id_fkey"
            columns: ["new_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      active_files: {
        Row: {
          id: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          bucket: string
          storage_path: string
          category: string | null
          entity_type: string | null
          entity_id: string | null
          is_public: boolean
          signed_url_expires_in: number
          uploaded_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          filename?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          bucket?: string
          storage_path?: string
          category?: string | null
          entity_type?: string | null
          entity_id?: string | null
          is_public?: boolean
          signed_url_expires_in?: number
          uploaded_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          filename?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          bucket?: string
          storage_path?: string
          category?: string | null
          entity_type?: string | null
          entity_id?: string | null
          is_public?: boolean
          signed_url_expires_in?: number
          uploaded_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      _up_users_staging: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          firstname: string | null
          gender: string | null
          is_coach: boolean | null
          is_phone_visible: boolean | null
          lastname: string | null
          legacy_up_user_id: number | null
          linkedin_profile: string | null
          locale: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          firstname?: string | null
          gender?: string | null
          is_coach?: boolean | null
          is_phone_visible?: boolean | null
          lastname?: string | null
          legacy_up_user_id?: number | null
          linkedin_profile?: string | null
          locale?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          firstname?: string | null
          gender?: string | null
          is_coach?: boolean | null
          is_phone_visible?: boolean | null
          lastname?: string | null
          legacy_up_user_id?: number | null
          linkedin_profile?: string | null
          locale?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_in_startup: {
        Args: { sid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
