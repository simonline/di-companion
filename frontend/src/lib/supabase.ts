import { createClient } from '@supabase/supabase-js';
import type {
  Database,
  Document,
  FileRecord,
  User,
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
  UserMethod,
  UserMethodCreate,
  UserMethodUpdate,
  UserQuestion,
  UserQuestionCreate,
  UserQuestionUpdate,
  StartupQuestion,
  StartupQuestionCreate,
  StartupQuestionUpdate,
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
      debug: true,
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

// Magic Link Authentication - sends magic link for passwordless login
export async function supabaseSendMagicLink(email: string) {
  const options: any = {
    shouldCreateUser: false, // Don't create new users via magic link login
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  };

  // Login doesn't require captcha - only signup does

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options,
  });

  if (error) throw new Error(handleSupabaseError(error));

  return { success: true, message: 'Check your email for the magic link!' };
}

// OTP Authentication - sends 6-digit code instead of magic link (legacy, kept for compatibility)
export async function supabaseSendOtp(email: string) {
  return supabaseSendMagicLink(email);
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

// Passwordless registration with magic link and hCaptcha
export async function supabaseRegister(userData: {
  email: string;
  acceptedPrivacyPolicy?: boolean;
  captchaToken?: string;
  isCoach?: boolean;
}): Promise<{
  user: { id: string; email: string }
}> {
  // For passwordless signup, we use signInWithOtp which sends a magic link
  const options: any = {
    shouldCreateUser: true,
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: {
      accepted_privacy_policy: userData.acceptedPrivacyPolicy || false,
      privacy_policy_accepted_at: userData.acceptedPrivacyPolicy ? new Date().toISOString() : null,
      is_coach: userData.isCoach || false,
    },
  };

  // Include captchaToken for signup if provided (Supabase has captcha enabled)
  if (userData.captchaToken) {
    options.captchaToken = userData.captchaToken;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: userData.email,
    options,
  });

  if (error) {
    // Check if user already exists
    if (error.message?.includes('User already registered')) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    throw new Error(handleSupabaseError(error));
  }

  // For OTP signup, we don't get user data immediately
  // User will be created when they click the magic link
  return {
    user: {
      id: '', // Will be set after email confirmation
      email: userData.email,
    },
  };
}

// Create or update user profile (called after email confirmation)
export async function supabaseCreateProfile(profileData: ProfileCreate & { id: string }): Promise<Profile> {
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select()
    .eq('id', profileData.id)
    .single();

  if (existingProfile) {
    // Update existing profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        username: profileData.username,
        given_name: profileData.given_name,
        family_name: profileData.family_name,
        gender: profileData.gender,
        position: profileData.position,
        bio: profileData.bio,
        linkedin_profile: profileData.linkedin_profile,
        is_coach: profileData.is_coach || false,
        phone: profileData.phone,
        is_phone_visible: profileData.is_phone_visible || false,
      })
      .eq('id', profileData.id)
      .select()
      .single();

    if (updateError) throw new Error(handleSupabaseError(updateError));
    return profile as Profile;
  } else {
    // Create new profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: profileData.id,
        username: profileData.username,
        given_name: profileData.given_name,
        family_name: profileData.family_name,
        gender: profileData.gender,
        position: profileData.position,
        bio: profileData.bio,
        linkedin_profile: profileData.linkedin_profile,
        is_coach: profileData.is_coach || false,
        phone: profileData.phone,
        is_phone_visible: profileData.is_phone_visible || false,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation failed for user:', profileData.id, profileError);
      if (profileError.message?.includes('row-level security policy')) {
        throw new Error('Profile creation failed. Please contact support to complete your registration.');
      }
      throw new Error(handleSupabaseError(profileError));
    }

    // Handle avatar upload if provided
    if (profileData.avatarFile) {
      const session = await getSession();
      const fileRecord = await uploadFileToBackend(
        profileData.avatarFile,
        'avatar',
        'profile',
        profileData.id,
        session?.access_token
      );

      if (fileRecord) {
        // Update profile with avatar_id
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_id: fileRecord.id })
          .eq('id', profileData.id);

        if (!updateError) {
          profile.avatar_id = fileRecord.id;
        } else {
          console.error('Failed to update profile with avatar:', updateError);
        }
      }
    }

    return profile as Profile;
  }
}

export async function supabaseMe(): Promise<{ user: User; profile: Profile | null; metadata?: any }> {
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
        // Return user with null profile and metadata
        return {
          user: {
            id: authUser.id,
            email: authUser.email || '',
            user_metadata: authUser.user_metadata || {}
          },
          profile: null,
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

    // Return user and profile separately with metadata
    return {
      user: {
        id: authUser.id,
        email: authUser.email || '',
        user_metadata: authUser.user_metadata || {}
      },
      profile: {
        ...profile,
        avatar: { url: avatarUrl }
      } as Profile,
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
    const fileRecord = await uploadFileToBackend(
      avatar,
      'avatar',
      'profile',
      id as string
    );

    if (fileRecord) {
      avatarId = fileRecord.id;
    } else {
      throw new Error('Failed to upload avatar');
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
    .select("*")
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
      related_patterns:patterns_related_patterns_lnk!patterns_related_patterns_lnk_fk(
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
  return (data as any || []).map((pattern: any) => {
    // Get image URL from the joined file record using backend endpoint
    const imageUrl = pattern.image_id ? getFileUrl(pattern.image_id) : '';

    // Transform related_patterns to extract the nested pattern objects
    const transformedRelatedPatterns = pattern.related_patterns?.map((rel: any) => rel.related) || [];

    return {
      ...pattern,
      image: { url: imageUrl },
      related_patterns: transformedRelatedPatterns,
    };
  });
}

export async function supabaseGetPattern(id: string): Promise<Pattern> {
  const { data, error } = await supabase
    .from('patterns')
    .select(`
      *,
      related_patterns:patterns_related_patterns_lnk!patterns_related_patterns_lnk_fk(
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

  // Transform related_patterns to extract the nested pattern objects
  const transformedRelatedPatterns = (data as any).related_patterns?.map((rel: any) => rel.related) || [];

  return {
    ...(data as any),
    image: { url: imageUrl },
    related_patterns: transformedRelatedPatterns,
  } as Pattern;
}

// Startups
export async function supabaseCreateStartup(startup: StartupCreate): Promise<Startup> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('startups')
    .insert(startup)
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
  if (updates.progress) dbUpdate.progress = updates.progress;
  if (updates.internal_comment !== undefined) dbUpdate.internal_comment = updates.internal_comment;
  if (updates.coach_id !== undefined) dbUpdate.coach_id = updates.coach_id;

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
    .select('*')
    .gte('created_at', '2025-09-01T00:00:00.000Z')
    .order('name', { ascending: true });

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

// Shared file upload helper function (DRY principle)
export async function uploadFileToBackend(
  file: File,
  category: string,
  entityType: string,
  entityId: string,
  accessToken?: string | null
): Promise<{ id: string;[key: string]: any } | null> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Get access token if not provided
    let token = accessToken;
    if (!token) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || null;
    }

    if (!token) {
      console.error('No access token available for file upload');
      return null;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Build query params
    const params = new URLSearchParams();
    params.append('category', category);
    params.append('entity_type', entityType);
    params.append('entity_id', entityId);

    // Upload to backend
    const response = await fetch(`${backendUrl}/api/files/upload?${params}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`File upload failed (${response.status}):`, errorText);
      return null;
    }

    const fileRecord = await response.json();

    if (!fileRecord || !fileRecord.id) {
      console.error('Invalid file record returned from upload');
      return null;
    }

    return fileRecord;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

// Helper function to get document URL
export function getDocumentUrl(documentId: string, forceDownload: boolean = true): string {
  if (!documentId) return '';

  // Always use backend URL for document serving
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Simple direct document serving - backend handles auth
  // Add download parameter to force download instead of inline display
  return `${backendUrl}/api/documents/${documentId}?download=${forceDownload}`;
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
    // Determine the category based on entity type
    const category = entityType === 'startup' ? 'logo' :
      entityType === 'profile' ? 'avatar' : 'image';

    // Use the shared upload function
    const fileRecord = await uploadFileToBackend(
      imageFile,
      category,
      entityType,
      entityId
    );

    if (!fileRecord) {
      console.error(`Failed to upload ${entityType} image`);
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

export async function supabaseGetQuestions(category?: string, topic?: string): Promise<Question[]> {
  let query = supabase
    .from('questions')
    .select('*');

  // Filter by category if provided - categories is a JSON array field
  // We need to check if the JSON array contains the category value
  if (category) {
    // Use the @> operator to check if the JSON array contains the value
    query = query.filter('categories', 'cs', `["${category}"]`);
  }

  // Filter by topic if provided
  if (topic) {
    query = query.eq('topic', topic);
  }

  const { data, error } = await query.order('order', { ascending: true });

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
    .eq('method_id', methodId);

  if (error) {
    throw new Error(handleSupabaseError(error));
  }

  // Return the first item if found, otherwise null
  return data && data.length > 0 ? data[0] : null;
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
      patterns:recommendations_patterns_lnk(
        pattern:patterns(*)
      ),
      coach:profiles!coach_id(*),
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
      coach:profiles!coach_id(*),
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
    .select(`
      *,
      invited_by_id:profiles(
        id,
        username,
        given_name,
        family_name
      )
    `)
    .eq('startup_id', startupId);

  if (error) throw new Error(handleSupabaseError(error));

  // Transform the data to flatten the nested structure
  const invitations = data?.map((inv: any) => ({
    ...inv,
    invited_by: inv.invited_by?.profiles
  })) || [];

  return invitations;
}

export async function supabaseCreateInvitation(invitation: InvitationCreate & { inviter_name: string; startup_name: string }): Promise<any> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const token = await supabase.auth.getSession();

  const response = await fetch(`${backendUrl}/api/invitations/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.data?.session?.access_token}`
    },
    body: JSON.stringify({
      email: invitation.email,
      startup_id: invitation.startup_id,
      inviter_name: invitation.inviter_name,
      startup_name: invitation.startup_name
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send invitation');
  }

  const result = await response.json();
  return result.invitation;
}

export async function supabaseAcceptInvitation(token: string): Promise<any> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const sessionToken = await supabase.auth.getSession();

  const response = await fetch(`${backendUrl}/api/invitations/accept/${token}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken.data?.session?.access_token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to accept invitation');
  }

  const result = await response.json();

  // Update progress to set startup-team to true
  const { data: startup, error: startupError } = await supabase
    .from('startups')
    .select('progress')
    .eq('id', result.startup?.id)
    .single();

  if (!startupError && startup) {
    await supabase
      .from('startups')
      .update({
        progress: {
          ...(startup.progress as object || {}),
          'startup-team': true
        }
      })
      .eq('id', result.startup?.id);
  }

  return result;
}

export async function supabaseAutoAcceptInvitations(): Promise<{
  success: boolean;
  acceptedCount: number;
  acceptedInvitations: Array<{ startup_id: string; startup_name: string }>;
}> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const userEmail = authData.user.email;
  const userId = authData.user.id;

  console.log('Auto-accepting invitations for:', userEmail, 'userId:', userId);

  // Find all pending invitations for this email
  const { data: invitations, error: invitationsError } = await supabase
    .from('invitations')
    .select('*, startup:startups(*)')
    .eq('email', userEmail!)
    .eq('invitation_status', 'pending');

  if (invitationsError) {
    console.error('Error fetching invitations:', invitationsError);
    return { success: true, acceptedCount: 0, acceptedInvitations: [] };
  }

  console.log('Found invitations:', invitations);

  if (!invitations || invitations.length === 0) {
    console.log('No pending invitations found for email:', userEmail);
    return { success: true, acceptedCount: 0, acceptedInvitations: [] };
  }

  const acceptedInvitations = [];
  const now = new Date();

  for (const invitation of invitations) {
    // Check if invitation hasn't expired
    const expiresAt = new Date(invitation.expires_at!);
    if (expiresAt < now) {
      continue;
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('startups_users_lnk')
      .select('*')
      .eq('startup_id', invitation.startup_id!)
      .eq('user_id', userId)
      .single();

    console.log('Checking existing membership for startup:', invitation.startup_id, 'result:', existingMember, 'error:', memberCheckError);

    // Note: single() returns an error if no rows found, so we check for that
    if (!existingMember && memberCheckError?.code !== 'PGRST116') {
      console.error('Error checking membership:', memberCheckError);
      continue;
    }

    if (!existingMember) {
      console.log('Adding user to startup:', invitation.startup_id);

      // First, ensure the user has a profile (create a basic one if not)
      const { data: profileCheck, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!profileCheck && profileCheckError?.code === 'PGRST116') {
        console.log('Profile does not exist, creating basic profile for user:', userId);
        // Create a basic profile for the user
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
          });

        if (profileCreateError) {
          console.error('Error creating profile:', profileCreateError);
          continue;
        }
        console.log('Basic profile created');
      }

      // Now add user to startup
      const { error: linkError } = await supabase
        .from('startups_users_lnk')
        .insert({
          startup_id: invitation.startup_id,
          user_id: userId
        });

      if (linkError) {
        console.error('Error adding user to startup:', linkError);
        continue;
      }
      console.log('Successfully added user to startup');
    } else {
      console.log('User already member of startup:', invitation.startup_id);
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ invitation_status: 'accepted' })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      continue;
    }

    // Update startup progress to set startup-team to true
    if (invitation.startup) {
      await supabase
        .from('startups')
        .update({
          progress: {
            ...(invitation.startup.progress as object || {}),
            'startup-team': true
          }
        })
        .eq('id', invitation.startup_id!);
    }

    acceptedInvitations.push({
      startup_id: invitation.startup_id!,
      startup_name: invitation.startup?.name || 'Unknown Startup'
    });
  }

  return {
    success: true,
    acceptedCount: acceptedInvitations.length,
    acceptedInvitations
  };
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
      patterns:methods_patterns_lnk(
        pattern:patterns(*)
      )
    `)
    .eq('id', id!)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseGetMethodByName(name: string): Promise<Method | null> {
  const { data, error } = await supabase
    .from('methods')
    .select('*')
    .eq('name', name)
    .maybeSingle();
  if (error) throw new Error(handleSupabaseError(error));
  return data;
}

// User Methods
export async function supabaseGetUserMethods(
  userId?: string,
  methodId?: string,
  startupId?: string
): Promise<UserMethod[]> {
  let query = supabase
    .from('user_methods')
    .select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }
  if (methodId) {
    query = query.eq('method_id', methodId);
  }
  if (startupId) {
    query = query.eq('startup_id', startupId);
  }

  const { data, error } = await query;
  if (error) throw new Error(handleSupabaseError(error));
  return data as UserMethod[];
}

export async function supabaseGetUserMethod(id: string): Promise<UserMethod> {
  const { data, error } = await supabase
    .from('user_methods')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(handleSupabaseError(error));
  return data;
}

export async function supabaseGetUserMethodByName(
  userId: string,
  methodName: string
): Promise<UserMethod | null> {
  const { data, error } = await supabase
    .from('user_methods')
    .select('*')
    .eq('user_id', userId)
    .eq('method_id', methodName)
    .maybeSingle();

  if (error) throw new Error(handleSupabaseError(error));
  return data;
}

export async function supabaseCreateUserMethod(userMethod: UserMethodCreate): Promise<UserMethod> {
  const { data, error } = await supabase
    .from('user_methods')
    .insert(userMethod)
    .select()
    .single();
  if (error) throw new Error(handleSupabaseError(error));
  return data;
}

export async function supabaseUpdateUserMethod(userMethod: UserMethodUpdate): Promise<UserMethod> {
  const { id, ...payload } = userMethod;
  const { data, error } = await supabase
    .from('user_methods')
    .update(payload)
    .eq('id', id!)
    .select()
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

// Startup Questions
export async function supabaseGetStartupQuestions(
  startupId?: string,
  patternId?: string
): Promise<StartupQuestion[]> {
  let query = supabase
    .from('startup_questions')
    .select(`
      *,
      pattern:patterns(*),
      question:questions(*)
    `);

  if (startupId) {
    query = query.eq('startup_id', startupId);
  }

  if (patternId) {
    query = query.eq('pattern_id', patternId);
  }

  const { data, error } = await query;

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseGetStartupQuestion(id: string): Promise<StartupQuestion> {
  const { data, error } = await supabase
    .from('startup_questions')
    .select(`
      *,
      pattern:patterns(*),
      question:questions(*),
      startup:startups(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseFindStartupQuestion(
  startupId: string,
  patternId: string,
  questionId: string
): Promise<StartupQuestion | null> {
  const { data, error } = await supabase
    .from('startup_questions')
    .select(`
      *,
      pattern:patterns(*),
      question:questions(*),
      startup:startups(*)
    `)
    .eq('startup', startupId)
    .eq('pattern', patternId)
    .eq('question', questionId)
    .maybeSingle();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseUpdateStartupQuestion(
  updateStartupQuestion: StartupQuestionUpdate
): Promise<StartupQuestion> {
  const { id, ...updates } = updateStartupQuestion;

  const { error } = await supabase
    .from('startup_questions')
    .update({
      answer: updates.answer,
    })
    .eq('id', id!);

  if (error) throw new Error(handleSupabaseError(error));

  return supabaseGetStartupQuestion(id!);
}

export async function supabaseCreateStartupQuestion(
  createStartupQuestion: StartupQuestionCreate
): Promise<StartupQuestion> {
  const { data, error } = await supabase
    .from('startup_questions')
    .insert(createStartupQuestion)
    .select()
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return supabaseGetStartupQuestion(data.id);
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

export async function supabaseResendInvitation(id: string): Promise<any> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const token = await supabase.auth.getSession();

  const response = await fetch(`${backendUrl}/api/invitations/resend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.data?.session?.access_token}`
    },
    body: JSON.stringify({
      invitation_id: id
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to resend invitation');
  }

  const result = await response.json();
  return result.invitation;
}

export async function supabaseGetInvitationByToken(token: string): Promise<Invitation> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (error) throw new Error(handleSupabaseError(error));

  return data;
}

export async function supabaseGetStartupMembers(startupId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('startups_users_lnk')
    .select(`
      user:profiles(*)
    `)
    .eq('startup_id', startupId);

  if (error) throw new Error(handleSupabaseError(error));
  if (!data || data.length === 0) return [];

  // Extract the profiles from the result
  return data.map(item => item.user) as any;
}

export async function supabaseGetAvailableStartups(): Promise<Startup[]> {
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .is('coach_id', null)
    .gte('created_at', '2025-09-01T00:00:00.000Z')
    .order('name', { ascending: true });

  if (error) throw new Error(handleSupabaseError(error));

  return data as Startup[];
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

    // Get the auth token to include in the request
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = {};

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    // Upload to backend
    const response = await fetch(`${backendUrl}/api/documents/upload?${params}`, {
      method: 'POST',
      body: formData,
      headers,
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