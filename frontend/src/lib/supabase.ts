import { createClient } from '@supabase/supabase-js';
import type {
  Database,
  Document,
  FileRecord,
  User,
  UserCreate,
  Profile,
  ProfileCreate,
  ProfileUpdate,
  Pattern,
  Startup,
  StartupCreate,
  StartupUpdate,
  StartupPattern,
  StartupPatternCreate,
  StartupPatternUpdate,
  Survey,
  Question,
  Method,
  StartupMethod,
  StartupMethodCreate,
  StartupMethodUpdate,
  Recommendation,
  RecommendationCreate,
  RecommendationUpdate,
  Invitation,
  InvitationCreate,
  UserQuestion,
  UserQuestionCreate,
  UserQuestionUpdate,
  Request,
  RequestCreate,
  RequestUpdate
} from '@/types/database';
import { CategoryEnum } from '@/utils/constants';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('[Supabase Init] URL:', supabaseUrl);
console.log('[Supabase Init] Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Create a singleton instance to avoid multiple clients
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

if (!supabaseInstance) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Init] Missing required environment variables!');
    console.error('[Supabase Init] VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET');
    console.error('[Supabase Init] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'  // Use PKCE flow for better security
    }
  });
}

export const supabase = supabaseInstance;

// Session helper
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw new Error(handleSupabaseError(error));
  return session;
}

// Error handler function
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (error?.error?.message) {
    return error.error.message;
  }
  return 'An unexpected error occurred';
}

// Type alias removed - using imported Tables type

// Authentication functions
export async function supabaseLogin(identifier: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });

  if (error) throw new Error(handleSupabaseError(error));

  // Get full user data
  const userData = await supabaseMe();

  return {
    jwt: data.session?.access_token || '',
    ...userData,
  };
}

// OTP Authentication - sends 6-digit code instead of magic link
export async function supabaseSendOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Don't create new users via OTP
    },
  });

  if (error) throw new Error(handleSupabaseError(error));

  return { success: true, message: 'Check your email for the login code!' };
}

// Verify OTP (for email verification after magic link click)
export async function supabaseVerifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw new Error(handleSupabaseError(error));

  // Get full user data
  const userData = await supabaseMe();

  return {
    jwt: data.session?.access_token || '',
    ...userData,
  };
}

export async function supabaseRegister(userData: UserCreate & ProfileCreate): Promise<{
  jwt: string,
  user: User,
  profile: Profile
}> {
  // First, sign up the user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password!,
    options: {
      data: {
        username: userData.username,
        given_name: userData.given_name,
        family_name: userData.family_name,
      },
    },
  });

  if (authError) throw new Error(handleSupabaseError(authError));

  // Create user profile in the users table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user!.id,
      email: userData.email,
      username: userData.username,
      given_name: userData.given_name,
      family_name: userData.family_name,
      gender: userData.gender,
      position: userData.position,
      bio: userData.bio,
      linkedin_profile: userData.linkedin_profile,
      is_coach: userData.is_coach || false,
      phone: userData.phone,
      is_phone_visible: userData.is_phone_visible || false,
    })
    .select()
    .single();

  if (profileError) throw new Error(handleSupabaseError(profileError));

  // Handle avatar upload with new file system if provided
  if (userData.avatarFile && authData.user) {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', userData.avatarFile);

      // Build query params
      const params = new URLSearchParams();
      params.append('category', 'avatar');
      params.append('entity_type', 'profile');
      params.append('entity_id', authData.user.id);

      // Upload to backend
      const response = await fetch(`${backendUrl}/api/files/upload?${params}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${authData.session?.access_token}`,
        },
      });

      if (response.ok) {
        const fileRecord = await response.json();

        // Update profile with avatar_id
        if (fileRecord && fileRecord.id) {
          await supabase
            .from('profiles')
            .update({ avatar_id: fileRecord.id })
            .eq('id', authData.user.id);
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  }

  return {
    jwt: authData.session?.access_token || '',
    user: {
      id: authData.user!.id,
      email: userData.email,
    },
    profile: profile
  };
}

export async function supabaseMe(): Promise<{ user: User; profile: Profile | null }> {
  console.log('[supabaseMe] Starting to fetch user data...');

  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    console.log('[supabaseMe] Auth user fetched:', authUser?.email);

    if (authError) {
      console.error('[supabaseMe] Auth error:', authError);
      throw new Error(handleSupabaseError(authError));
    }
    if (!authUser) {
      console.error('[supabaseMe] No authenticated user');
      throw new Error('Not authenticated');
    }

    // Try to get user profile with avatar file joined
    console.log('[supabaseMe] Fetching profile for user:', authUser.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      console.error('[supabaseMe] Profile fetch error:', profileError);
      // If profile doesn't exist, return basic auth data
      if (profileError.code === 'PGRST116' || profileError.message?.includes('not found')) {
        console.log('[supabaseMe] Profile not found, returning null profile');
        // Return user with null profile
        return {
          user: {
            id: authUser.id,
            email: authUser.email || '',
          },
          profile: null
        };
      }
      throw new Error(handleSupabaseError(profileError));
    }

    console.log('[supabaseMe] Profile fetched successfully');

    // Generate avatar URL from file record
    const avatarUrl = profile.avatar_id ? getFileUrl(profile.avatar_id) : undefined;

    // Get user's startups
    console.log('[supabaseMe] Fetching startups for user:', authUser.id);
    const { data: startupLinks, error: startupsError } = await supabase
      .from('startups_users_lnk')
      .select('startup:startups(*)')
      .eq('user_id', authUser.id);

    if (startupsError) {
      console.error('[supabaseMe] Startups fetch error:', startupsError);
      // Continue without startups if table doesn't exist
    }

    const startups = startupLinks?.map((link: any) => link.startup).filter(Boolean) || [];
    console.log('[supabaseMe] Found', startups.length, 'startups');

    // Return user and profile separately
    return {
      user: {
        id: authUser.id,
        email: authUser.email || '',
      },
      profile: {
        ...profile,
        avatar: { url: avatarUrl }
      } as Profile
    };
  } catch (error) {
    console.error('[supabaseMe] Fatal error:', error);
    throw error;
  }
}

export async function supabaseLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(handleSupabaseError(error));
}

export async function supabaseUpdateProfile(updateProfile: ProfileUpdate) {
  const { id, avatar, ...updates } = updateProfile as any;
  let avatarId;

  // Handle avatar upload with new file system if provided
  if (avatar) {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const { data: { session } } = await supabase.auth.getSession();

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', avatar);

      // Build query params
      const params = new URLSearchParams();
      params.append('category', 'avatar');
      params.append('entity_type', 'profile');
      params.append('entity_id', id as string);

      // Upload to backend
      const response = await fetch(`${backendUrl}/api/files/upload?${params}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
      }

      const fileRecord = await response.json();
      if (fileRecord && fileRecord.id) {
        avatarId = fileRecord.id;
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }

  // Prepare update data - fields already match database schema
  const dbUpdate: any = { ...updates };
  if (avatarId) dbUpdate.avatar_id = avatarId;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdate)
    .eq('id', id!)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseGetProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user:users(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[supabaseGetProfileById] Error fetching profile:', error);
    return null;
  }

  return data as any;
}

// Patterns
export async function supabaseGetPatterns(category?: CategoryEnum): Promise<Pattern[]> {
  let query = supabase
    .from('patterns')
    .select(`
      *,
      related_patterns:patterns_related_patterns_lnk!patterns_related_patterns_lnk_ifk(
        related:patterns!inv_pattern_id(*)
      ),
      methods:methods_patterns_lnk(
        method:methods(*)
      ),
      survey:patterns_survey_lnk(
        survey:surveys(*)
      ),
      questions:questions_patterns_lnk(
        question:questions(*)
      )
    `);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  // Transform the data to match the expected format
  return (data as any || []).map((pattern: Pattern) => {
    // Get image URL from the joined file record using backend endpoint
    const imageUrl = pattern.image_id ? getFileUrl(pattern.image_id) : '';

    return {
      ...pattern,
      image: { url: imageUrl },
    };
  });
}

export async function supabaseGetPattern(id: string): Promise<Pattern> {
  const { data, error } = await supabase
    .from('patterns')
    .select(`
      *,
      related_patterns:patterns_related_patterns_lnk!patterns_related_patterns_lnk_ifk(
        related:patterns!inv_pattern_id(*)
      ),
      methods:methods_patterns_lnk(
        method:methods(*)
      ),
      survey:patterns_survey_lnk(
        survey:surveys(*)
      ),
      questions:questions_patterns_lnk(
        question:questions(*)
      )
    `)
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Get image URL from the joined file record using backend endpoint
  const imageUrl = data.image_id ? getFileUrl(data.image_id) : '';

  return {
    ...(data as any),
    image: { url: imageUrl },
  } as Pattern;
}

// Startups
export async function supabaseCreateStartup(startup: StartupCreate): Promise<Startup> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  // Field names already match database schema
  const dbStartup = {
    name: startup.name,
    start_date: startup.start_date,
    founders_count: startup.founders_count,
    background: startup.background,
    product_type: startup.product_type,
    idea: startup.idea,
    industry: startup.industry,
    industry_other: startup.industry_other,
    target_market: startup.target_market,
    phase: startup.phase,
    is_problem_validated: startup.is_problem_validated,
    qualified_conversations_count: startup.qualified_conversations_count,
    is_target_group_defined: startup.is_target_group_defined,
    is_prototype_validated: startup.is_prototype_validated,
    is_mvp_tested: startup.is_mvp_tested,
    categories: startup.categories,
  };

  const { data, error } = await supabase
    .from('startups')
    .insert(dbStartup)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Link user to startup
  await supabase
    .from('startups_users_lnk')
    .insert({
      user_id: authData.user.id,
      startup_id: data.id,
    });

  return data as Startup;
}

export async function supabaseUpdateStartup(updateStartup: StartupUpdate): Promise<Startup> {
  const { id, ...updates } = updateStartup;

  // Field names already match database schema
  const dbUpdate: any = {};
  if (updates.name) dbUpdate.name = updates.name;
  if (updates.start_date) dbUpdate.start_date = updates.start_date;
  if (updates.founders_count) dbUpdate.founders_count = updates.founders_count;
  if (updates.background) dbUpdate.background = updates.background;
  if (updates.product_type) dbUpdate.product_type = updates.product_type;
  if (updates.idea) dbUpdate.idea = updates.idea;
  if (updates.industry) dbUpdate.industry = updates.industry;
  if (updates.industry_other) dbUpdate.industry_other = updates.industry_other;
  if (updates.target_market) dbUpdate.target_market = updates.target_market;
  if (updates.phase) dbUpdate.phase = updates.phase;
  if (updates.is_problem_validated !== undefined) dbUpdate.is_problem_validated = updates.is_problem_validated;
  if (updates.qualified_conversations_count) dbUpdate.qualified_conversations_count = updates.qualified_conversations_count;
  if (updates.is_target_group_defined !== undefined) dbUpdate.is_target_group_defined = updates.is_target_group_defined;
  if (updates.is_prototype_validated !== undefined) dbUpdate.is_prototype_validated = updates.is_prototype_validated;
  if (updates.is_mvp_tested !== undefined) dbUpdate.is_mvp_tested = updates.is_mvp_tested;
  if (updates.scores) dbUpdate.scores = updates.scores;
  if (updates.score) dbUpdate.score = updates.score;
  if (updates.categories) dbUpdate.categories = updates.categories;

  const { data, error } = await supabase
    .from('startups')
    .update(dbUpdate)
    .eq('id', id!)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data as Startup;
}


export async function supabaseGetUserStartups(userId: string): Promise<Startup[]> {
  const { data: startupLinks, error } = await supabase
    .from('startups_users_lnk')
    .select('startup:startups(*)')
    .eq('user_id', userId);

  if (error) throw new Error(handleSupabaseError(error));

  return startupLinks?.map((link: any) => link.startup).filter(Boolean) || [];
}

export async function supabaseGetStartup(id: string): Promise<Startup> {
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data as Startup;
}

export async function supabaseGetStartups(): Promise<Startup[]> {
  const { data, error } = await supabase
    .from('startups')
    .select('*');

  if (error) throw new Error(handleSupabaseError(error));

  return data as Startup[];
}

// Startup Patterns
export async function supabaseGetStartupPatterns(
  startupId: string,
  patternId?: string,
  dateRange?: { start_date: Date; endDate: Date }
): Promise<StartupPattern[]> {
  let query = supabase
    .from('startup_patterns')
    .select(`
      *,
      pattern:patterns(*),
      startup:startups(*)
    `)
    .eq('startup_id', startupId)
    .order('created_at', { ascending: true });

  if (patternId) {
    query = query.eq('pattern_id', patternId);
  }

  if (dateRange) {
    query = query
      .gte('created_at', dateRange.start_date.toISOString())
      .lte('created_at', dateRange.endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return data as StartupPattern[];
}

export async function supabaseCreateStartupPattern(
  startupPattern: StartupPatternCreate
): Promise<StartupPattern> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('startup_patterns')
    .insert({
      startup_id: startupPattern.startup_id,
      pattern_id: startupPattern.pattern_id,
      user_id: authData.user.id,
      points: startupPattern.points || 0,
    })
    .select(`
      *,
      pattern:patterns(*),
      startup:startups(*)
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data as StartupPattern;
}

export async function supabaseUpdateStartupPattern(
  updateStartupPattern: StartupPatternUpdate
): Promise<StartupPattern> {
  const { id, ...updates } = updateStartupPattern;

  const { data, error } = await supabase
    .from('startup_patterns')
    .update({
      points: updates.points,
    })
    .eq('id', id!)
    .select(`
      *,
      pattern:patterns(*),
      startup:startups(*)
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data as StartupPattern;
}

// Other functions follow similar pattern...
// Due to length constraints, I'll create the remaining functions in a follow-up


// File management functions for new S3-based storage

export async function supabaseGetFiles(
  entityType?: string,
  entityId?: string,
  category?: string
): Promise<FileRecord[]> {
  let query = supabase
    .from('files')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  if (entityId) {
    query = query.eq('entity_id', entityId);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseGetFile(fileId: string): Promise<FileRecord | null> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(handleSupabaseError(error));
  }

  return data;
}

export async function supabaseCreateFileRecord(
  file: Omit<FileRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<FileRecord> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('files')
    .insert({
      ...file,
      uploaded_by: authData.user.id,
    })
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));
  return data;
}

export async function supabaseUpdateFileRecord(
  fileId: string,
  updates: Partial<FileRecord>
): Promise<FileRecord> {
  const { data, error } = await supabase
    .from('files')
    .update(updates)
    .eq('id', fileId)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));
  return data;
}

export async function supabaseDeleteFile(fileId: string): Promise<void> {
  // Soft delete
  const { error } = await supabase
    .from('files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', fileId);

  if (error) throw new Error(handleSupabaseError(error));
}

// Helper function to get image URL from file record
export function getFileUrl(fileId: string): string {
  if (!fileId) return '';

  // Always use backend URL for file serving
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Simple direct file serving - backend handles WebDAV auth
  return `${backendUrl}/api/files/${fileId}`;
}

// Helper function to get document URL
export function getDocumentUrl(documentId: string): string {
  if (!documentId) return '';

  // Always use backend URL for document serving
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Simple direct document serving - backend handles auth
  return `${backendUrl}/api/documents/${documentId}`;
}

// Helper function to get avatar URL - maintained for backward compatibility
// This handles both old string URLs and new file objects
export function getAvatarUrl(avatarUrlOrFile?: string | any): string | null {
  if (!avatarUrlOrFile) return null;

  // If it's a string and already a full URL, return as is
  if (typeof avatarUrlOrFile === 'string') {
    if (avatarUrlOrFile.startsWith('http')) {
      return avatarUrlOrFile;
    }
    // For legacy storage paths, use backend to serve the file
    // The backend will handle the WebDAV/S3 authentication
    return getFileUrl(avatarUrlOrFile);
  }

  // If it's a file object, use getFileUrl
  return getFileUrl(avatarUrlOrFile.id);
}

// Helper function to update entity image
export async function updateEntityImage(
  entityType: 'pattern' | 'method' | 'startup' | 'profile',
  entityId: string,
  imageFile: File
): Promise<string | null> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const { data: { session } } = await supabase.auth.getSession();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', imageFile);

    // Build query params
    const params = new URLSearchParams();
    params.append('category', entityType === 'startup' ? 'logo' : entityType === 'profile' ? 'avatar' : 'image');
    params.append('entity_type', entityType);
    params.append('entity_id', entityId);

    // Upload to backend
    const response = await fetch(`${backendUrl}/api/files/upload?${params}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Error uploading ${entityType} image:`, error);
      return null;
    }

    const fileRecord = await response.json();

    if (!fileRecord || !fileRecord.id) {
      console.error(`Error: No file record returned for ${entityType}`);
      return null;
    }

    // Update the entity with the new image_id
    const columnName = entityType === 'startup' ? 'logo_id' :
      entityType === 'profile' ? 'avatar_id' :
        'image_id';

    const tableName = `${entityType}s`;

    const { error: updateError } = await supabase
      .from(tableName as any)
      .update({ [columnName]: fileRecord.id })
      .eq('id', entityId);

    if (updateError) {
      console.error(`Error updating ${entityType} with image_id:`, updateError);
      return null;
    }

    return fileRecord.id;
  } catch (error) {
    console.error(`Error uploading ${entityType} image:`, error);
    return null;
  }
}

// Surveys and Questions
export async function supabaseGetSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      *,
      questions:questions_survey_lnk(
        question:questions(*)
      )
    `);

  if (error) throw new Error(handleSupabaseError(error));

  return data as Survey[];
}

export async function supabaseGetSurvey(id: string): Promise<Survey> {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      *,
      questions:questions_survey_lnk(
        question:questions(*)
      )
    `)
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data as Survey;
}

export async function supabaseGetSurveyByName(name: string): Promise<Survey> {
  const { data, error } = await supabase
    .from('surveys')
    .select(`
      *,
      questions:questions_survey_lnk(
        question:questions(*)
      )
    `)
    .eq('name', name)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data as Survey;
}

export async function supabaseGetSurveyQuestions(surveyId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions_survey_lnk')
    .select('question:questions(*)')
    .eq('survey_id', surveyId);

  if (error) throw new Error(handleSupabaseError(error));

  return data.map(link => link.question) as Question[];
}

export async function supabaseGetPatternQuestions(patternId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions_patterns_lnk')
    .select('question:questions(*)')
    .eq('pattern_id', patternId);

  if (error) throw new Error(handleSupabaseError(error));

  return data.map(link => link.question) as Question[];
}

export async function supabaseGetPatternMethods(patternId: string): Promise<Method[]> {
  const { data, error } = await supabase
    .from('methods_patterns_lnk')
    .select('method:methods(*)')
    .eq('pattern_id', patternId);

  if (error) throw new Error(handleSupabaseError(error));

  return data.map(link => link.method) as Method[];
}

export async function supabaseGetQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('order', { ascending: true });

  if (error) throw new Error(handleSupabaseError(error));

  return data as Question[];
}

// Startup Methods
export async function supabaseGetStartupMethods(
  startupId?: string,
  patternId?: string,
  methodId?: string
): Promise<StartupMethod[]> {
  let query = supabase
    .from('startup_methods')
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `);

  if (startupId) {
    query = query.eq('startup_id', startupId);
  }
  if (patternId) {
    query = query.eq('pattern_id', patternId);
  }
  if (methodId) {
    query = query.eq('method_id', methodId);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseGetStartupMethod(id: string): Promise<StartupMethod> {
  const { data, error } = await supabase
    .from('startup_methods')
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `)
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseFindStartupMethod(
  startupId: string,
  patternId: string,
  methodId: string
): Promise<StartupMethod | null> {
  const { data, error } = await supabase
    .from('startup_methods')
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `)
    .eq('startup_id', startupId)
    .eq('pattern_id', patternId)
    .eq('method_id', methodId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw new Error(handleSupabaseError(error));
  }

  return data;
}

export async function supabaseCreateStartupMethod(createStartupMethod: StartupMethodCreate, resultFiles: File[]): Promise<StartupMethod> {
  // Create the startup method
  const { data, error } = await supabase
    .from('startup_methods')
    .insert(createStartupMethod)
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Handle document uploads using the new documents table with generic entity linking
  if (resultFiles && resultFiles.length > 0) {
    await Promise.all(
      resultFiles.map(async (file) => {
        // Upload document with entity linking
        await uploadDocument(
          file,
          'startup_method',  // entity_type
          data.id,           // entity_id
          'resultFiles',     // entity_field
          'method_result'    // category
        );
      })
    );
  }

  return data;
}

export async function supabaseUpdateStartupMethod(updateStartupMethod: StartupMethodUpdate, resultFiles: File[]): Promise<StartupMethod> {
  const { id, ...payload } = updateStartupMethod;

  // Update the startup method
  const { data, error } = await supabase
    .from('startup_methods')
    .update(payload)
    .eq('id', id!)
    .select(`
      *,
      startup:startups(*),
      pattern:patterns(*),
      method:methods(*)
    `)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Handle document uploads using the new documents table with generic entity linking
  if (resultFiles && resultFiles.length > 0) {
    await Promise.all(
      resultFiles.map(async (file) => {
        // Upload document with entity linking
        await uploadDocument(
          file,
          'startup_method',  // entity_type
          id as string,      // entity_id
          'resultFiles',     // entity_field
          'method_result'    // category
        );
      })
    );
  }

  return data;
}

// Recommendations
export async function supabaseGetRecommendations(startupId?: string): Promise<Recommendation[]> {
  let query = supabase
    .from('recommendations')
    .select(`
      *,
      patterns:recommendations_patterns(
        pattern:patterns(*)
      ),
      coach:users!coach_id(*),
      startup:startups(*)
    `);

  if (startupId) {
    query = query.eq('startup_id', startupId);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return data as any;
}


export async function supabaseCreateRecommendation(
  recommendation: RecommendationCreate,
  patternIds?: string[]
): Promise<Recommendation> {
  const { data: rec, error } = await supabase
    .from('recommendations')
    .insert(recommendation)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Link patterns if provided
  if (patternIds && patternIds.length > 0) {
    await supabase
      .from('recommendations_patterns_lnk')
      .insert(
        patternIds.map(patternId => ({
          recommendation_id: rec.id,
          pattern_id: patternId,
        }))
      );
  }

  return supabaseGetRecommendation(rec.id);
}

async function supabaseGetRecommendation(id: string): Promise<Recommendation> {
  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      patterns:recommendations_patterns_lnk(
        pattern:patterns(*)
      ),
      coach:users!coach_id(*),
      startup:startups(*)
    `)
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data as any;
}

// Invitations
export async function supabaseGetInvitations(startupId: string): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('startup_id', startupId);

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseCreateInvitation(invitation: InvitationCreate): Promise<Invitation> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      ...invitation,
      // Note: invited_by relationship needs to be created separately
      token,
    })
    .select("*")
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseAcceptInvitation(token: string): Promise<Invitation> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  // Find and update invitation
  const { data, error } = await supabase
    .from('invitations')
    .update({ updated_at: new Date().toISOString() })
    .eq('token', token)
    .select('*')
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  // Add user to startup
  await supabase
    .from('startups_users_lnk')
    .insert({
      user_id: authData.user.id,
      startup_id: data.startup_id,
    });

  return data;
}

// Methods
export async function supabaseGetMethods(): Promise<Method[]> {
  const { data, error } = await supabase
    .from('methods')
    .select('*');

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseGetMethod(id: string): Promise<Method | null> {
  const { data, error } = await supabase
    .from('methods')
    .select(`
      *,
      patterns:methods_patterns(
        pattern:patterns(*)
      )
    `)
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

// User Questions
export async function supabaseGetUserQuestions(
  startupId?: string,
  userId?: string,
  patternId?: string
): Promise<UserQuestion[]> {
  let query = supabase
    .from('user_questions')
    .select(`
      *,
      pattern:patterns(*),
      question:questions(*)
    `);

  if (startupId) {
    query = query.eq('startup_id', startupId);
  }
  if (userId) {
    query = query.eq('user_id', userId);
  }
  if (patternId) {
    query = query.eq('pattern_id', patternId);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return data as UserQuestion[];
}

export async function supabaseUpdateUserQuestion(
  updateUserQuestion: UserQuestionUpdate
): Promise<UserQuestion> {
  const { id, ...updates } = updateUserQuestion;

  const { error } = await supabase
    .from('user_questions')
    .update({
      answer: updates.answer,
    })
    .eq('id', id!);

  if (error) throw new Error(handleSupabaseError(error));

  return supabaseGetUserQuestion(id!);
}

export async function supabaseGetUserQuestion(id: string): Promise<UserQuestion> {
  const { data, error } = await supabase
    .from('user_questions')
    .select(`
      *
    `)
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data as UserQuestion;
}

export async function supabaseFindUserQuestion(
  userId: string,
  patternId: string,
  questionId: string,
  startupId?: string
): Promise<UserQuestion | null> {
  // Find the user question by matching foreign keys directly
  let query = supabase
    .from('user_questions')
    .select('*')
    .eq('user_id', userId)
    .eq('pattern_id', patternId)
    .eq('question_id', questionId);

  if (startupId) {
    query = query.eq('startup_id', startupId);
  } else {
    query = query.is('startup_id', null);
  }

  const { data, error } = await query.single();

  if (error) {
    // No matching question found
    return null;
  }

  return supabaseGetUserQuestion(data.id);
}

export async function supabaseCreateUserQuestion(
  createUserQuestion: UserQuestionCreate
): Promise<UserQuestion> {
  const { data, error } = await supabase
    .from('user_questions')
    .insert(createUserQuestion)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return supabaseGetUserQuestion(data.id);
}

// Requests
export async function supabaseGetRequests(startupId?: string): Promise<Request[]> {
  let query = supabase
    .from('requests')
    .select('*');

  if (startupId) {
    query = query.eq('startup_id', startupId);
  }

  const { data, error } = await query;
  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseCreateRequest(request: RequestCreate): Promise<Request> {
  const { data, error } = await supabase
    .from('requests')
    .insert(request)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseUpdateRequest(update: RequestUpdate): Promise<Request> {
  const { id, ...updates } = update;

  const { data, error } = await supabase
    .from('requests')
    .update({
      comment: updates.comment,
      read_at: updates.read_at,
    })
    .eq('id', id!)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseDeleteRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', id!);

  if (error) throw new Error(handleSupabaseError(error));
}

// Additional missing functions
export async function supabaseUpdateRecommendation(
  update: RecommendationUpdate,
  patternIds?: string[]
): Promise<Recommendation> {
  const { id, ...updates } = update;

  const { error } = await supabase
    .from('recommendations')
    .update({
      comment: updates.comment,
      read_at: updates.read_at,
    })
    .eq('id', id!);

  if (error) throw new Error(handleSupabaseError(error));

  // Update pattern links if provided
  if (patternIds !== undefined) {
    // Delete existing pattern links
    await supabase
      .from('recommendations_patterns_lnk')
      .delete()
      .eq('recommendation_id', id!);

    // Add new pattern links
    if (patternIds.length > 0) {
      await supabase
        .from('recommendations_patterns_lnk')
        .insert(
          patternIds.map(patternId => ({
            recommendation_id: id,
            pattern_id: patternId,
          }))
        );
    }
  }

  return supabaseGetRecommendation(id!);
}

export async function supabaseDeleteRecommendation(id: string): Promise<void> {
  const { error } = await supabase
    .from('recommendations')
    .delete()
    .eq('id', id!);

  if (error) throw new Error(handleSupabaseError(error));
}

export async function supabaseGetStartupPattern(startupPatternId: string): Promise<StartupPattern> {
  const patterns = await supabaseGetStartupPatterns('', '', undefined);
  const pattern = patterns.find(p => p.id === startupPatternId);
  if (!pattern) throw new Error('Startup pattern not found');
  return pattern;
}

export async function supabaseDeleteInvitation(id: string): Promise<void> {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', id!);

  if (error) throw new Error(handleSupabaseError(error));
}

export async function supabaseResendInvitation(id: string): Promise<Invitation> {
  return supabaseGetInvitation(id);
}

async function supabaseGetInvitation(id: string): Promise<Invitation> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseGetStartupMembers(startupId: string): Promise<Profile[]> {
  // First get the user IDs from the link table
  const { data: linkData, error: linkError } = await supabase
    .from('startups_users_lnk')
    .select('user_id')
    .eq('startup_id', startupId);

  if (linkError) throw new Error(handleSupabaseError(linkError));

  if (!linkData || linkData.length === 0) return [];

  // Then get the profiles for those users
  const userIds = linkData.filter(link => link.user_id).map(link => link.user_id).filter(Boolean) as string[];
  if (userIds.length === 0) return [];

  const { data, error: profilesError } = await supabase
    .from('profiles')
    .select('*, users!inner(*)')
    .in('id', userIds);

  if (profilesError) throw new Error(handleSupabaseError(profilesError));

  return data;
}

export async function supabaseGetAvailableStartups(): Promise<Startup[]> {
  return supabaseGetStartups();
}

// Password reset functions
export async function supabaseForgotPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw new Error(handleSupabaseError(error));
}

export async function supabaseResetPassword(_token: string, password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw new Error(handleSupabaseError(error));
}

// Document handling functions
export async function uploadDocument(
  file: File,
  entityType?: string,
  entityId?: string,
  entityField?: string,
  category?: string
): Promise<string | null> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Build query params
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (entityType) params.append('entity_type', entityType);
    if (entityId) params.append('entity_id', entityId);
    if (entityField) params.append('entity_field', entityField);

    // Upload to backend
    const response = await fetch(`${backendUrl}/api/documents/upload?${params}`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies if using session auth
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return null;
  }
}

export async function getDocument(documentId: string): Promise<Document | null> {
  try {
    // First get metadata from Supabase
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      return null;
    }

    // Add the URL for accessing the document
    if (data) {
      (data as any).url = getDocumentUrl(documentId);
    }

    return data;
  } catch (error) {
    console.error('Error in getDocument:', error);
    return null;
  }
}

export async function getDocuments(filters?: {
  category?: string;
  uploadedBy?: string;
  entityType?: string;
  entityId?: string;
  entityField?: string;
}): Promise<Document[]> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Build query params
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.entityType) params.append('entity_type', filters.entityType);
    if (filters?.entityId) params.append('entity_id', filters.entityId);
    if (filters?.entityField) params.append('entity_field', filters.entityField);

    // Fetch from backend
    const response = await fetch(`${backendUrl}/api/documents?${params}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const documents = await response.json();

    // Add URLs to each document
    return documents.map((doc: any) => ({
      ...doc,
      url: getDocumentUrl(doc.id)
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Delete via backend API
    const response = await fetch(`${backendUrl}/api/documents/${documentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Delete failed: ${error}`);
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export async function getEntityDocuments(
  entityType: string,
  entityId: string,
  entityField?: string
): Promise<Document[]> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Build query params
    const params = new URLSearchParams();
    if (entityField) params.append('entity_field', entityField);

    // Fetch from backend
    const response = await fetch(
      `${backendUrl}/api/documents/entity/${entityType}/${entityId}?${params}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch entity documents');
    }

    const documents = await response.json();

    // Add URLs to each document
    return documents.map((doc: any) => ({
      ...doc,
      url: getDocumentUrl(doc.id)
    }));
  } catch (error) {
    console.error('Error fetching entity documents:', error);
    return [];
  }
}

// Convenience function for startup method documents
export async function getStartupMethodDocuments(
  startupMethodId: string,
  field: string = 'resultFiles'
): Promise<Document[]> {
  return getEntityDocuments('startup_method', startupMethodId, field);
}